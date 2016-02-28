---
layout: post
title: Mongo Uninque Index and Bulk Write应用问题总结
---
####背景####
某个游戏数据平台最近线上连续出现了两个比较诡异的问题，都是在数据库迁移之后遇到的问题，而且问题二是解决问题一的时候，没有考虑充分实现细节带来的问题，这些问题出现的原因都是开发者没有充分理解好MongoDB的唯一索引与批量写操作。
####现象####
 * 问题一的表现是某个时间点的总人数趋势图的骤降，前后相邻的时间点正常
![请在这里输入图片描述](http://ww1.sinaimg.cn/mw690/c752b558gw1f1e5v3c41fj20b40b40tf.jpg)
 * 问题二的表现是部分服务器的人数(非总人数)趋势图的骤升，而且恰好是正常人数的2倍
![请在这里输入图片描述](http://ww4.sinaimg.cn/mw690/c752b558gw1f1e5v2eb6wj20b40b4js0.jpg)

网易大部分游戏项目输出在线人数的时间间隔是5分钟，一般而言，某个时间段的人数都是比较平衡，不会突然出现波动。
####问题分析####
#####问题一######
首先来看系统的数据结构设计，所有的服务(群组/物理器服务器/游戏进程)都是由树状结构来描述，通常根结点是一个虚拟结点，表示其子结点的所有服务的总人数，部署在各个服务器的Agent只需要提交叶子结点的人数数据，非叶子结点都要由结构关系向上递归计算得出。

![结构图](http://ww1.sinaimg.cn/mw690/c752b558gw1f1e5v3p5qej20i00b3jsn.jpg)

数据库中一个meta表保存所有项目的服务的结构关系，服务的人数数据按时间戳保存在每一个对应项目的number表，每次提交人数数据只提交当前时间戳叶子结点数据(可能是服务器或者游戏进程)，然后服务端根据服务的组织关系向上递归一层一层计算出父结点、祖先结点、根结点的数据。

![请在这里输入图片描述](http://ww3.sinaimg.cn/mw690/c752b558gw1f1e5v2z1g0j20l40fjwgu.jpg)

上图中的normal是正确状态的执行过程(ui指的是unique index)，每个结点由id,type,timestamp来确定，根据数据库已经保存的结构关系，1、2的父结点是3。首先提交的1是叶子结点，然后根据结构关系生成其父结点、再交提交2，因为已经有当前时间戳父结点，所以会直接给父结点加2，最终生成的父结点总数为3。这里插入每个结点用的是开启Upsert选项的Mongo Update操作。

 * Upsert是Mongo Update操作的一个选项，当Upsert为true时，若update无法找到目标文档的时候，update操作就会转化成insert，若找到目标文档，则更新目标文档。
 * 这里使用upsert的原因是为每次都是叶子结点提交人数，然后根据其结构关系向上生成祖先结点，多个叶子结点有共同父结点，若某个叶子结点已经生成了(插入)共同父结点，其它叶结点只需要更新父结点即可，因此统一用upsert来插入所有结点，若用insert,应用层需要做一些判断逻辑。
 
之前在没有使用bulk write的时候，项目比较少，数据写入速度慢，并发度不高，基本上都是正常的A情况，后面发现这个问题一的时候，到线上数据库查询发现，某些项目的非叶结点出现了重复，即B出现了两个父结点(id,type,timestamp)相同，非叶结点原本是由(id,type,timestamp)来唯一确定，但现在出现了重复。查阅Mongo官方文档可以看到
 >WARNING
To avoid inserting the same document more than once, only use upsert: true if the query field is uniquely indexed

可以看到，upsert的使用只能够在建立了unique index的情况下使用，否则会出现重复插入，这也是出现问题一的原因，所以给各个项目的表添加按(id,type,timestamp)建立unique index之后问题一就没有再出现。建立了Unique Index之后，多个并发的Upsert操作的结果有两种可能
>- update the newly inserted document, or
- fail when they attempted to insert a duplicate.
If the operation fails because of a duplicate index key error, applications may retry the operation which will succeed as an update operation.

#####问题二#####
在解决问题一之后，问题二就接接踵而来，父结点人数正常，子结点人数恰好是游戏输出的2倍，因为2倍这个数字比较特别，所以我们也就立刻怀疑是重复upsert了，与游戏产品确认提交没问题，就开始排查WEB服务的日志，后来发现，每次人数double的时间点，WEB都会输出一段Bulk Write失败的日志。
 >[xxx xxx 25 12:10:01 2015] [error] [client x.x.x.x] #0 /home/opsys/xxxnum/include/entity.php(257): MongoWriteBatch->execute()\n#1 /home/opsys/xxxnum/api/save-xxx.php(85): Entity->saveNumber(Array)\n#2 /home/opsys/xxxnum/api/save-xxx.php(120): save(Array)\n#3 {main}

这段日志只输出了error的message，其实还是没看到触发问题的原因，如果仔细研究error的数据结构，这里面是包含了许多有用的信息的，如果能输出更有助于定位原因的信息会更加好。这让我们怀疑是程序里面实现的重试机制导致了问题二的出现，然后开始各种查阅资料和测试，最终定位原因是我们的重试机制没有考虑细节。
首先看Mongo Bulk Write的细节，一个Bulk Write操作可能是有序或者无序的

 - Order，序列化地执行，若Bulk中的某个操作写入失败，不再执行后面的操作
 - Unorder，并行化地执行，若Bulk中的某个操作写入失败，不影响其它的操作
 
**这是一个比较大的坑点，与传统关系型数据不同，MongoDB没有事务，所以这个Bulk Write操作也没有原子性。**
我们用的是Unorder的Bulk Write，并在应用层简单粗暴地加上类似下面的失败重试机制，伪代码如下
 
	    bulk = db.items.initializeUnorderedBulkOp();
	    bulk.insert(item1);
	    bulk.insert(itme2);
	    bulk.insert(item3);
	    try {
	          bulk.execute();
	    } catch(MongoException) {
	          retry(bulk.execute());
	    }

上面的的做法是没有充分考虑到Unordered的Bulk Write在某个操作执行失败的时候，是不会影响其它的操作，所以造成图C的情况，1和2同时用upsert插入其共同的父结点，因为此时又用了唯一索引，必然有一个插入失败，这里是2的父结点(但结点2已经成功插入)，抛出了异常，而我们的重试机制会将结点2到父结点这个链路的结点的整个bulk操作重试，所以就再造成了2结点重复插入，数据恰好是正确数据的double。

其实要正确的处理这种情况有两种方法，一种是通过bulk.execute的返回结果BulkWriteResult，另一种是分析MongoExecption，上面提到最初的日志只是输出了MongoException的Message信息，其实在这种情况，BulkWrite和MongoException都会保存一个WriteError的对象，里面包含了bulk操作的索引和更具体的错误信息，只要对其进行分析，只针对对失败的操作重构bulk操作就正确了。正确的做法如下

    	bulk = db.items.initializeUnorderedBulkOp();
	    bulk.insert(item1);
	    bulk.insert(itme2);
	    bulk.insert(item3);
	    try {
	          bulk.execute();
	    } catch(MongoException) {
	          errorItems = getErrorItem(MongoException.WriteError)
	          bulk = db.items.initializeUnorderedBulkOp();
	          bulk.insert(errorItems);
	          retry(bulk.execute());
	    }

####参考文献####
[1]Mongo Update.https://docs.mongodb.org/manual/reference/method/db.collection.update/

[2]Mongo Unique Index.https://docs.mongodb.org/manual/core/index-unique/#index-type-unique

[3]Mongo Bulk.https://docs.mongodb.org/manual/core/bulk-write-operations/ 
