## 简介
为nodejs访问mysql数据库提供强大流畅的api的工具类库，目标是希望访问数据库逻辑都能使用一行代码完成，让访问数据库变得更加简单优雅。

## 初始化

初始化对象如下，或可以参照examples中的用法
```javascript
const DbClient = require("ali-mysql-client");

// 支持传入数据库连接配置
const db1 = new DbClient({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'secret',
  database : 'my_db'
});

// 也支持直接传入ali-rds或egg-mysql对象
const db2 = new DbClient(this.app.mysql);
```

不同框架的使用示例：
- [demo-egg](https://github.com/liuhuisheng/ali-mysql-client/tree/master/examples/demo-egg)
- [demo-koa](https://github.com/liuhuisheng/ali-mysql-client/tree/master/examples/demo-koa)
- [demo-express](https://github.com/liuhuisheng/ali-mysql-client/tree/master/examples/demo-express)

比如在egg框架中，可以在egg项目根目录下app.js中注入到app全局对象中，然后在controller或service中就可以通过this.app.db访问；

app.js
```javascript
const DbClient = require("ali-mysql-client");

module.exports = function (app) {
  app.db = new DbClient(app.mysql);

  const config = app.db.config();

  // 自定义operator
  config.registerOperator('ne', ({ field, value }) => {
    return { sql: '?? <> ?', arg: [ field, value ] };
  });

  // 自定义ignore
  config.registerIgnore('ifNumber', ({ value }) => {
    return !isNaN(Number(value));
  });

  // 监听事件 执行前
  config.onBeforeExecute(function({ sql }){
    console.log(sql);
  });

  // 监听事件 执行后
  config.onAfterExecute(function({ sql, result }){
    console.log(result);
  });

  // 监听事件 执行出错
  config.onExecuteError(function({ sql, error }){
    console.log(error);
  });
};
```

## 事务控制

```javascript
const trans = await db.useTransaction();

try {
  // 数据库操作
  // await trans.insert(...)
  // await trans.update(...)
  await trans.commit();
} catch (e) {
  await trans.rollback();
}
```

## 查询

查询单个值

```javascript
//查询单个值，比如下面例子返回的是数字51，满足条件的数据条数
var result = await db
  .select("count(1)")
  .from("page")
  .where("name", "测试", "like")
  .queryValue();
```

查询单条数据

```javascript
// 查询单条数据，返回的是 result = {id:12, name: '测试页面', ....}
const result = await db
  .select("*")
  .from("page")
  .where("id", 12) // id = 12
  .queryRow();
```

查询多条数据

```javascript
// 查询多条数据 返回的是 ressult = [{...}, {...}];
const result = await db
  .select("*")
  .from("page")
  .where("name", "测试页面", 'like') // name like '%测试页面%'
  .queryList();
```

查询多条数据（服务端分页）

```javascript
// 查询多条数据（服务端分页） 返回的是 ressult = {total: 100, rows:[{...}, {...}]};
const result = await db
  .select("*")
  .from("page")
  .where("id", 100, "lt") // id < 100
  .queryListWithPaging(3, 20); //每页 20 条，取第 3 页
```

多表关联查询

```javascript
// 多表关联查询
var result = await db
  .select("a.page_id, a.saga_key")
  .from("page_edit_content as a")
  .join("left join page as b on b.id = a.page_id")
  .where("b.id", 172)
  .queryList();
```

查询除了支持各种多表join外，当然还支持groupby orderby having等复杂查询操作

```javascript
const result = await db
  .select("a1 as a, b1 as b, count(c) as count")
  .from("table")
  .where("date", db.literals.now, "lt") // date < now()
  .where("creator", "huisheng.lhs")  // creator = 'huisheng.lhs"
  .groupby("a1, b1")
  .having("count(category) > 10")
  .orderby("id desc")
  .queryListWithPaging(2); //默认每页20条，取第2页
```

## 插入

```javascript
const task = {
  action: "testA",
  description: "desc1",
  state: "123",
  result: "result1"
};

//插入一条数据
const result = await db.insert("task", task).execute();

//也支持直接写字段，支持增加字段
const result = await db
  .insert("task")
  .column("action", "test")
  .column("create_time", db.literals.now)
  .execute();

//插入多条数据
const tasks = [ task1, taks2, task3 ];
const result = await db.insert("task", tasks).execute();

//支持增加或覆盖字段
const result = await db.insert("task", tasks)
  .column('create_time', db.literals.now)  // 循环赋值给每一行数据
  .column('create_user', 'huisheng.lhs')
  .execute();
```

## 更新

```javascript
const task = {
  action: "testA",
  description: "desc1",
  state: "123",
  result: "updateResult"
};

//更新数据
const result = await db
  .update("task", task)
  .where("id", 1)
  .execute();

//更新数据，支持增加字段
const result = await db
  .insert("task")
  .column("action", "test-id22")
  .column("create_time", db.literals.now)
  .where('id', 2)
  .execute();
```

## 删除

```javascript
//删除id为1的数据
const result = await db
  .delete("task")
  .where("id", 1)
  .execute();
```

## 复杂条件查询

```javascript
// 复杂查询条件
const result = await db
  .select("*")
  .from("page")
  .where("id", 100, "gt") // id > 100
  .where("tags", "test", "like") //name like '%test%'
  .where("tech", tech, "eq", "ifHave") // tech='tech_value' 当 tech 为空时，不做为查询条件
  .where("tags", tags, "findinset", "ifHave", "or")
  .queryList();
```

查询条件所有参数说明

```javascript
// 查询条件所有参数
const result = await db
  .where(field, value, operator, ignore, join) // 支持的所有参数
  .where({field, value, operator, ignore, join}) //支持对象参数
  .queryList();
```

1. **field** 字段名
2. **value** 字段值
3. **operator** 操作符
4. **ignore** 是否加为条件，返回false时忽略条件
5. **join** 连接符号

其中1,2不需要再解释了，5的话就是条件连接and or两种，默认为and。

特别需要说明的是3 operator 和 4 ignore 都支持传字符串或传入函数，传入字符串则会匹配到已定义的逻辑，其函数的形式如下：

```javascript
const customOperator = ({field, value}) => {
    if (...){
        return {sql: '...', arg: [...]};
    }
    
    return {sql: '...', arg: [...]};
};

const customIgnore = ({field, value}) => {
    if (...){
        return false;
    }
    
    return true;
};

//也可以注册到全局使用
const config = db.config();
config.registerOperator("customOperator", customOperator);
config.registerIgnore("customIgnore", customIgnore);
```

operator大家能理解是为拼接查询条件使用的逻辑封装，复杂条件的拓展能力都可以靠自定义的operator来完成。

ignore需要再解释下，它就是当满足xx条件时则忽略该条件，ignore设计的初衷是为了简化代码，比如以下代码是很常见的，界面上有输入值则查询，没有输入值时不做为查询条件：

```javascript
const query = db
  .select("*")
  .from("page");
  .where("id", 100, "lt");

if (name){
    query.where("name", name, 'like');
}

if (tech){
    query.where('tech', tech)
}

const result = await query.queryList();
```

上面的代码使用ignore时，则可简化为：

 ```javascript
const result = await db
  .select("*")
  .from("page")
  .where("id", 100, "lt")
  .where("name", name, "like", "ifHave") //使用内置 ifHave，如果name为非空值时才加为条件
  .where("source_id", tech, "eq", "ifNumber") //使用内置 ifNumber
  .queryList();
```

真实场景中的复杂查询示例

```javascript
// 复杂查询，真实场景示例，项目中拓展了keyword、setinset等operator及ignore
const result = await app.db
  .select('a.*, b.id as fav_id, c.name as biz_name, d.group_name')
  .from('rocms_page as a')
  .join(`left join favorite as b on b.object_id = a.id and b.object_type = "rocms_page" and b.create_user = "${this.ctx.user.userid}"`)
  .join('left join rocms_biz as c on c.biz = a.biz')
  .join('left join rocms_biz_group as d on d.biz = a.biz and d.group_code = a.biz_group')
  // 关键字模糊查询
  .where('a.name,a.biz,a.biz_group,a.support_clients,a.owner,a.status', query.keywords, 'keywords', 'ifHasValueNotNumber') // 关键字在这些字段中模糊查询
  .where('a.id', query.keywords, 'eq', 'ifNumber') // 关键字中输入了数字时当作id查询
  // 精确查询
  .where('a.id', query.id, 'eq', 'ifHave')
  .where('a.name', query.name, 'like', 'ifHave')
  .where('a.biz', query.biz, 'eq', 'ifHave')
  .where('a.biz_group', query.biz_group, 'eq', 'ifHave')
  .where('a.support_clients', query.support_clients, 'setinset', 'ifHave')
  .where('a.status', query.status, 'insetfind', 'ifHave')
  .where('a.owner', query.owner, 'eq', 'ifHave')
  .where('a.offline_time', query.owner, 'eq', 'ifHave')
  // TAB类型 我的页面own、我的收藏fav、所有页面all
  .where('a.owner', this.ctx.user.userid, 'eq', () => query.queryType === 'own')
  .where('b.id', 0, 'isnotnull', () => query.queryType === 'fav')
  // 分页查询
  .orderby('a.update_time desc, a.id desc')
  .queryListWithPaging(query.pageIndex, query.pageSize);
```

查询条件优先级

```javascript
// where a = 1 and (b = 1 or c < 1) and d = 1
const result = await db.select('*')
  .from('table')
  .where('a', 1)
  .where([
    {field: 'b', value: '1', operator:'eq'},
    {field: 'c', value: '1', operator:'lt', join: 'or'},
  ])
  .where('d', 1)
  .queryList();
```

## 已内置的operator及ignore
- [内置的默认operator](https://github.com/liuhuisheng/ali-mysql-client/blob/master/configuration/operator.js)
  - eq (equal)
  - ne (not equal)
  - in (in)
  - gt (greater than)
  - ge (greater than or equal)
  - lt (less than)
  - le (less than or equal）
  - isnull (is null)
  - isnotnull (is not null)
  - like (like)
  - startwith (start with)
  - endwith (end with)
  - between (between)
  - findinset (find_in_set(value, field))
  - insetfind (find_in_set(field, value))
  - sql (custom sql)
  - keywords (keywords query)

- [内置的默认ignore](https://github.com/liuhuisheng/ali-mysql-client/blob/master/configuration/ignore.js)
    - ifHave (如果有值则加为条件）
    - ifNumber (如果是数值则加为条件）
