# 电车之狼 · 界面与角色卡

《电车之狼》角色卡配套的酒馆助手界面脚本。两个界面都是自包含的单文件 HTML，由酒馆正则把占位符替换成这些文件的加载代码。

## 文件

| 文件 | 作用 | 对应占位符 |
|---|---|---|
| `界面/开局选择器.html` | 目标选择器：车厢 → 目标 → 服装 → 接近方式，二级页是随机人物生成器 | `<OpeningPlaceHolder/>` |
| `界面/状态栏.html` | 常驻面板：车号/下一站、目标身份、沦陷值、异常度、认知、衣物、身体；右上可切到账本看 18 人 | `<StatusPlaceHolderImpl/>` |
| `schema.ts` | MVU 变量结构（zod），与卡内 `schema.ts` 同源 | — |
| `电车之狼.png` | 角色卡本体 | — |

## CDN 地址（jsdelivr 镜像）

```
https://testingcf.jsdelivr.net/gh/xiaofeng11122/sillytavern-cards@main/电车之狼/界面/开局选择器.html
https://testingcf.jsdelivr.net/gh/xiaofeng11122/sillytavern-cards@main/电车之狼/界面/状态栏.html
```

## 在酒馆正则里怎么用

占位符替换规则里，把内容改成加载 CDN 链接（首尾各一行三反引号作为代码块标记）：

````
```
<body>
<script>
$('body').load('https://testingcf.jsdelivr.net/gh/xiaofeng11122/sillytavern-cards@main/电车之狼/界面/开局选择器.html')
</script>
</body>
```
````

`状态栏` 同理，把文件名换成 `状态栏.html`。同时需要一条 `promptOnly` 的规则把同名占位符从 AI 上下文里删掉。

## 说明

- 这两个文件不参与 `src/` 的 webpack 构建，是独立静态文件，放在 `dist/` 之外，因此不会被 `bundle` 工作流重建时清掉。
- 界面用 `position:fixed` 挂靠视口，用 `$('body').load()` 注入到酒馆页面里运行，不套 iframe。
- 读写变量走 MVU：优先 `Mvu.getMvuData` / `Mvu.replaceMvuData`，取不到时回退到 `getVariables` / `replaceVariables`（`message_id: 'latest'`）。
- jsdelivr 有缓存，改完文件约 12 小时内自动刷新；急用可在 jsdelivr 的 purge 工具里刷 `cdn.jsdelivr.net` 域名，或临时换 `fastly.jsdelivr.net`。
