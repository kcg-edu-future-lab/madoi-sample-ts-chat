import { Madoi, GetState, SetState, ClassName, Distributed, ChangeState } from "madoi-client";
import { madoiKey, madoiUrl } from "./keys";

window.addEventListener("load", ()=>{
    // Chatクラスのインスタンスを作成する。
    const chat = new Chat("chatForm", "chatLogDiv");

    // Madoiライブラリを使ってサービスに接続する。引数の"room/"以降はセッション識別文字列。
    const m = new Madoi(`${madoiUrl}/chat-o3i4sdf667alskdjj`, madoiKey);

    // chatインスタンスを登録する。共有に関するメソッドの情報はデコレータ(@???)から取得される。
    m.register(chat);
});

interface Log {name: string, message: string};
@ClassName("Chat")
class Chat{
    private chatLogDiv: HTMLDivElement;
    private logTemplate: HTMLTemplateElement;
    private logs: Log[] = [];
    constructor(chatFormId: string, chatLogDivId: string){
        // HTML内のタグをJavaScriptから操作するために，対応するElementオブジェクトを取り出す。
        const chatForm = document.getElementById(chatFormId) as HTMLFormElement;
        const nameInput = chatForm.querySelector("[data-id='name']") as HTMLInputElement;
        const messageInput = chatForm.querySelector("[data-id='message']") as HTMLInputElement;
        // チャットフォームのsubmitイベントで，chat.addMessageを実行する。
        chatForm.addEventListener("submit", e => {
            e.preventDefault();
            const name = nameInput.value.trim();
            const message = messageInput.value.trim();
            if(message.length > 0){
                // addMessage実行。プロキシが実行される。本来のaddMessageはサービスからメッセージが届いた際に実行される。
                this.addLog(name, message);
                messageInput.value = "";
            }
        });
        this.chatLogDiv = document.getElementById(chatLogDivId) as HTMLDivElement;
        this.logTemplate = this.chatLogDiv.querySelector("[data-id='logTemplate']") as HTMLTemplateElement;
    }

    // ログ領域にチャットメッセージを追加するメソッド
    @Distributed()
    @ChangeState()
    addLog(name: string, message: string){
        this.appendLog(name, message);
        this.chatLogDiv.scrollTop = this.chatLogDiv.scrollHeight;
        this.logs.push({name, message});
        // 100件以上は保持しないようにする。
        if(this.logs.length > 100){
            this.logs.splice(0, this.logs.length - 100);
        }
    }

    // ログ領域にログを追加するメソッド
    private appendLog(name: string, message: string){
        const log = this.logTemplate.content.cloneNode(true) as HTMLElement;
        log.querySelector("[data-id='name']")!.textContent = name;
        log.querySelector("[data-id='message']")!.textContent = message;
        this.chatLogDiv.append(log);
    }

    // 状態を取得するメソッド。
    @GetState()
    getState(){
        return this.logs;
    }

    @SetState()
    // 状態を設定するメソッド
    setState(logs: Log[]){
        this.logs = logs;
        this.chatLogDiv.innerHTML = "";
        for(const {name, message} of this.logs){
            this.appendLog(name, message);
        }
        this.chatLogDiv.scrollTop = this.chatLogDiv.scrollHeight;
    }
}
