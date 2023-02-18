"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_schedule_1 = __importDefault(require("node-schedule"));
node_schedule_1.default.scheduleJob("* * * * * *", function () {
    const date = new Date();
    console.log("hh:mm:30に実行します" + date);
});
const app = (0, express_1.default)();
app.get("/", (_, res) => {
    res.send("Hello world");
});
app.listen(3005, () => console.log("Server is running"));
//# sourceMappingURL=index.js.map