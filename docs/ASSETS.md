# 素材来源与许可

代码及原创 SVG 插图采用仓库中的 [MIT 许可](../LICENSE)。以下图片不包含在该代码许可中：

- `assets/images/awards/*.jpg`：用户提供的两张原始奖状照片，保留证书内容；网页中的边缘裁切仅改变显示区域。`pending.svg` 为纯黑占位图。
- `assets/images/avatar.png`：用户提供的个人头像。
- `assets/images/drone-navigation.png`、`assets/images/robot-perception.png`：用户提供的项目照片。
- `assets/videos/drone/full-process-demo.mp4`：用户提供的四旋翼无人机全流程实机演示视频；对应封面为 `assets/images/drone/full-process-demo.jpg`。
- `assets/videos/sweeper/`：用户提供的功能演示视频，以及从用户提供的 `爆炸视图.pptx` 中按点击目标拆出的五段硬件动画。来源对应表见该目录的 `manifest.json`。
- `assets/images/drone/`：来自用户提供的《居民楼道消防通道智能巡检无人机系统设计与实现》报告的硬件图片、运行截图及评估图。相关图片权利归原权利人所有，不纳入代码 MIT 许可。
- `assets/images/sweeper/`：上述视频的封面帧。
- `assets/images/uestc-emblem.png`：电子科技大学校徽，来源于[学校官方新闻网](https://news.uestc.edu.cn/info/1007/13146.htm)，相关权利归其权利人所有。

复用模板时，请替换为自己的图片或已获授权的素材，并在 `config.jsonc` 中修改对应路径。

`assets/images/sweeper-architecture.svg` 为原创可编辑矢量图，沿用本仓库无人机技术流程图的视觉风格。技术关系参考 [robot_challenge README](https://github.com/zzxy2006eee-cloud/robot_challenge/blob/main/README.md)（2026-11-16 读取），展示环视 BEV、双机分工、覆盖导航及独立视觉控制链路，不表示测试进度或验收结果。原始 SVG 内含文字、节点和连线，可直接编辑。黑色素材占位由 CSS 生成，不引用外部图片。
