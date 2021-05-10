import './gm_config.js'

const config = GM_config([{
        key: "pagecount",
        label: "最大页数 (自动获取时)",
        default: 20,
        type: "dropdown",
        values: [0, 5, 10, 20, 50, 1000],
    },
    {
        key: "newBatcherKeyHours",
        label: "批次更新间隔（小时），0为每次更新",
        default: 24,
        type: "dropdown",
        values: [0, 1, 2, 3, 5, 10, 24, 168, 168000],
    },
    {
        key: "markRankRed",
        label: "突出前N名教师的名次",
        default: 100,
        type: "dropdown",
        values: [5, 10, 30, 50, 120, 500, 3000, 5000, 10080],
    },
    {
        key: "version",
        type: "hidden",
        default: 1,
    },
]);
let conf = config.load();
config.onsave = (cfg) => {
    conf = cfg;
    $("#autogetnextpage").text("自动获取" + getAutoNextPagesCount() + "页");
};
GM_registerMenuCommand("设置", config.setup);

export {
    conf,
    config
}