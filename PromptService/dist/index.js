"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var cors_1 = __importDefault(require("cors"));
var promptRouters_1 = __importDefault(require("./routers/promptRouters"));
var app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
var port = process.env.PORT || '3000';
app.use("/api/v1/prompt", promptRouters_1.default);
app.listen(port, function () { return console.log("Server is running in http://localhost:" + port); });
//# sourceMappingURL=index.js.map