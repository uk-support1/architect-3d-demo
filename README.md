# CHABURIN ARCHITECTS — 3D Architecture Demo

架空の建築設計事務所「蒼建築設計事務所」のブランドサイトです。3D住宅とスクロールの情報設計を一体化し、外観・分解図・内部への接近・再構築をひとつの物語として構成しています。

## 起動方法

```bash
npm install
npm run dev
```

開発サーバーに表示されたローカルURLをブラウザで開きます。

## ビルド方法

```bash
npm run build
npm run preview
```

成果物は `dist/` に生成されます。

## 使用技術

- Vite
- Three.js
- GSAP / ScrollTrigger
- セマンティックHTML / CSS

## フォルダ構成

```text
.
├─ index.html        # ページ構造・SEOメタデータ
├─ src/
│  ├─ main.js        # 3D住宅、スクロール演出、UI制御
│  └─ style.css      # アートディレクション、レスポンシブ
├─ public/images/    # プロジェクト写真
└─ dist/             # ビルド成果物（Git管理外）
```

## 3D実装概要

外部3Dモデルには依存せず、基礎、床、白い左官壁、木質コア、間仕切り、ガラス、大庇、屋根、テラス、植栽をThree.jsのGeometryで組み立てています。部位をグループ化し、ScrollTriggerのスクロール進捗を位置・透明度・カメラへ同期することで、模型のような分解と正確な再構築を実現しています。PCではソフトシャドウ、モバイルではpixelRatioと影解像度を抑えます。`prefers-reduced-motion` 時は長いカメラ移動を簡略化します。

## 素材の出典

プロジェクト写真は [Pexels](https://www.pexels.com/) の無料素材を使用しています。各素材の出典URLは以下です。

- HOUSE N: https://www.pexels.com/photo/concept-of-modern-house-9976121/
- HOUSE K: https://www.pexels.com/photo/modern-house-facade-10610731/
- RENOVATION T: https://www.pexels.com/photo/modern-minimalist-house-exterior-design-8134820/

## GitHub Pages 公開方法

1. GitHubリポジトリの **Settings → Pages** を開く
2. **Build and deployment** で **GitHub Actions** を選択
3. `npm ci` と `npm run build` を実行し、`dist/` をPagesへデプロイするワークフローを追加

このプロジェクトの `vite.config.js` は相対ベースパスを使用するため、リポジトリ名に依存せずPagesで動作します。
