import express from "express";

class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(express.static('public'));
    }
}

export default new App().app;