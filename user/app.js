"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var cors_1 = __importDefault(require("cors"));
var db_1 = require("./config/db");
var Product_1 = __importDefault(require("./models/Product"));
var callback_api_1 = __importDefault(require("amqplib/callback_api"));
var app = (0, express_1.default)();
dotenv_1.default.config();
var PORT = process.env.PORT;
app.use((0, cors_1.default)({
    origin: "https://localhost:5173",
}));
(0, db_1.connect)();
app.use(express_1.default.json());
callback_api_1.default.connect("amqps://pgzzbmfy:qtm1vCdG-NW7YSwlH9I0VJE8cQWiqs2o@puffin.rmq2.cloudamqp.com/pgzzbmfy", function (err, connection) {
    if (err)
        throw new Error(err);
    connection.createChannel(function (err, channel) {
        if (err)
            throw new Error(err);
        channel.assertQueue("product_created", { durable: false });
        channel.assertQueue("product_updated", { durable: false });
        channel.assertQueue("product_deleted", { durable: false });
        channel.consume("product_created", function (msg) { return __awaiter(void 0, void 0, void 0, function () {
            var eventProduct, userProduct;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        eventProduct = JSON.parse(msg.content.toString());
                        return [4 /*yield*/, Product_1.default.create(__assign({ adminId: eventProduct._id }, eventProduct))];
                    case 1:
                        userProduct = _a.sent();
                        console.log("product created");
                        return [2 /*return*/];
                }
            });
        }); }, { noAck: true });
        channel.consume("product_updated", function (msg) {
            console.log(msg.content.toString());
        });
        channel.consume("product_deleted", function (msg) {
            console.log(msg.content.toString());
        });
        app.listen(PORT, function () {
            console.log("server connected to port ".concat(PORT));
        });
        process.on("beforeExit", function () {
            console.log("closing");
            connection.close();
        });
    });
});
