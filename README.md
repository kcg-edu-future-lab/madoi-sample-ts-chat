# madoi-sample-ts-chat

未来環境ラボで開発しているオブジェクト共有サービス madoi を使ってチャットを作成するサンプルのTypeScript版です。

実行するにはMadoiサーバが必要です。

## Madoiサーバの起動

適当なディレクトリで以下のコマンドを実行し、Madoi の madoi-volatileserver を起動してください。
詳細は、[MadoiのREADME](https://github.com/kcg-edu-future-lab/madoi)も参照してください。


```bash
git clone https://github.com/kcg-edu-future-lab/madoi
cd madoi
docker compose up
```

`docker compose up`を実行すると、Madoiのビルドが行われ、madoi-volatileserverが起動します。

## 必要なソフトウェアのインストール

下記のバージョンのnodejsで動作確認を行なっています。

* nodejs (v22.12.0)

## ビルドと起動

まず、このリポジトリをcloneし、リポジトリのディレクトリに移動してください。

```bash
git clone https://github.com/kcg-edu-future-lab/madoi-sample-ts-chat
cd madoi-sample-ts-chat
```

次に /src/keys.ts.sample をコピーして /src/keys.ts を作成し、適切に設定を行なってください。

```ts
// Madoi設定
export const madoiUrl = "ws://localhost:8080/madoi/rooms";
export const madoiKey = "MADOI_API_KEY";
```

MadoiサーバのデフォルトのMADOI_API_KEYは、[docker-compose.yml](https://github.com/kcg-edu-future-lab/madoi/blob/master/docker-compose.yml)を参照してください。


次のコマンドを実行して関連ライブラリをインストールしてください。

```bash
npm i
```

serveコマンドを実行すると、ブラウザが起動し、ホワイトボードアプリケーションが表示されます。

```bash
npm run serve
```

実行に成功すれば，アプリケーションが起動し，ブラウザが開き，チャット画面が表示されます。
表示された画面のテキストフィールドにメッセージを入力してEnterを押すか送信ボタンを押すと，チャットメッセージが送信されます。

静的ビルドを行うには、buildコマンドを実行してください。

```bash
npm run build
```


## コードの説明

madoiを使ったチャットのサンプルです。madoiは指定されたメソッドの実行を，同じセッションに参加しているアプリ間で共有するサービスです。このチャットサンプルのコード([index.ts](https://github.com/kcg-edu-future-lab/madoi-sample-ts-chat/blob/main/src/index.ts))では，まずチャットログを管理するクラスChatを作り，メソッドsendを以下のように記述しています。

```ts
class Chat{
    // 省略
    @Distributed()
    @ChangeState()
    send(name: string, message: string){
        const textSpan = document.createElement("span");
        textSpan.append(name + ": " + message);
        this.logDiv.append(textSpan);
        this.logDiv.append(document.createElement("br"));
        this.logDiv.scrollTop = this.logDiv.scrollHeight;
    }
}
```

このメソッドでは，名前(name)とメッセージ(message)を受け取り，チャットログに"名前: メッセージ"という文字列を追加しています。もしこの処理が他のブラウザでも実行されば，誰かがチャットログを追加したときに他のブラウザでも同じように追加されることになります。そのために，まずこのメソッドが共有の対象であることをmadoiに伝えるために，@Shareデコレータを宣言し，次に[index.ts](https://github.com/kcg-edu-future-lab/madoi-sample-ts-chat/blob/main/src/index.ts)の以下の部分で，madoiにchatオブジェクトを登録しています。

```js
window.addEventListener("load", ()=>{
    // 省略
    m.register(chat);
});
```

上記のコードが実行されると，chat.addLogメソッドが置き換えられ，メソッドが実行されたら一旦それをサービスに送信するようになります。サービスは参加している全てのブラウザにそれを送信し，ブラウザ側で受信されたら本来のchat.addLogの処理が実行されます。これにより，チャットログの共有が実現されます。
