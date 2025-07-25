# モダン NestJS タスク管理システム 🚀

NestJS を使用した包括的なタスク管理システム。ドメイン駆動設計（DDD）パターンを実装し、SQLite と PostgreSQL をサポートするマルチデータベースアーキテクチャを特徴としています。

## ✨ 機能

- 🏗️ **ドメイン駆動設計（DDD）** - アグリゲート、バリューオブジェクト、ドメインイベントを含むクリーンアーキテクチャ
- 🗄️ **マルチデータベース対応** - 開発環境用 SQLite、本番環境用 PostgreSQL
- 🔄 **モダン ORM** - 型安全性とマイグレーションを備えた Drizzle ORM
- 🧪 **包括的テスト** - ユニット、統合、E2E テストを含む 89+ テスト
- 📊 **リアルタイム API** - ヘルスモニタリング付き RESTful エンドポイント
- 🎯 **型安全性** - 完全な TypeScript 実装
- 🔧 **モダンツール** - ESLint、Prettier、Jest、開発スクリプト

## 🚀 クイックスタート

### 前提条件

- Node.js 18+ 
- npm または yarn
- SQLite（含まれています）または PostgreSQL（オプション）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/terukusu/claude-code-practice.git
cd claude-code-practice

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env

# 開発サーバーを起動
npm run start:dev
```

アプリケーションは `http://localhost:3000` で利用できます。

## 📖 API ドキュメント

### ヘルスチェックエンドポイント

- `GET /` - Hello world メッセージ
- `GET /health` - 稼働時間を含むシステムヘルスチェック
- `GET /api/hello` - JSON API ステータス

### ユーザー管理

- `GET /users` - 全ユーザーの一覧
- `POST /users` - 新しいユーザーを作成
- `GET /users/:id` - ID でユーザーを取得
- `PATCH /users/:id` - ユーザーを更新
- `DELETE /users/:id` - ユーザーを削除

### API 使用例

```bash
# 新しいユーザーを作成
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "田中太郎", "bio": "ソフトウェア開発者"}'

# 全ユーザーを取得
curl http://localhost:3000/users

# ヘルスチェック
curl http://localhost:3000/health
```

## 🧪 テスト

このプロジェクトには、全レイヤーをカバーする 89+ のテストケースを含む包括的なテストが含まれています。

### テストの実行

```bash
# 全テストを実行
npm test

# ウォッチモードでテストを実行
npm run test:watch

# E2E テストを実行
npm run test:e2e

# カバレッジレポートを生成
npm run test:cov

# 特定のテストファイルを実行
npm test -- src/domain/value-objects/email.value-object.spec.ts
```

### テストカバレッジ

- **ドメイン層**: 96%+ カバレッジ
- **バリューオブジェクト**: 100% カバレッジ
- **アグリゲート**: 96% カバレッジ
- **コントローラー**: 100% カバレッジ

### テスト構造

```
src/
├── domain/
│   ├── value-objects/          # バリューオブジェクトのユニットテスト
│   ├── aggregates/             # ドメインアグリゲートテスト
│   └── events/                 # ドメインイベントテスト
├── infrastructure/
│   └── repositories/           # リポジトリ統合テスト
└── app.controller.spec.ts      # コントローラーテスト

test/
└── app.e2e-spec.ts            # エンドツーエンド API テスト
```

## 🗄️ データベース設定

### SQLite（デフォルト - 開発環境）

追加設定は不要です。データベースファイルは `./data/database.sqlite` に自動作成されます。

### PostgreSQL（本番環境）

1. PostgreSQL をインストール
2. データベースを作成: `createdb hello_nestjs`
3. `.env` を更新:

```env
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://username:password@localhost:5432/hello_nestjs
```

### データベースコマンド

```bash
# マイグレーションファイルを生成
npm run db:generate

# スキーマをデータベースに適用
npm run db:push

# Drizzle Studio を開く（データベース GUI）
npm run db:studio
```

## 🏗️ プロジェクトアーキテクチャ

### ドメイン駆動設計構造

```
src/
├── domain/                     # ドメイン層（ビジネスロジック）
│   ├── aggregates/            # ドメインアグリゲート（Task、Project）
│   ├── entities/              # ドメインエンティティ
│   ├── value-objects/         # バリューオブジェクト（Email、Priority など）
│   ├── events/                # ドメインイベント
│   └── repositories/          # リポジトリインターフェース
├── application/               # アプリケーション層
│   ├── commands/              # コマンドハンドラー（CQRS）
│   ├── queries/               # クエリハンドラー
│   └── services/              # アプリケーションサービス
├── infrastructure/            # インフラストラクチャ層
│   ├── persistence/           # データベース設定
│   └── repositories/          # リポジトリ実装
└── presentation/              # プレゼンテーション層
    ├── controllers/           # REST コントローラー
    └── dto/                   # データ転送オブジェクト
```

### 主要コンポーネント

- **バリューオブジェクト**: 組み込み検証を持つ Email、TaskStatus、Priority
- **アグリゲート**: ビジネスルールとドメインイベントを持つ Task と Project
- **リポジトリパターン**: クリーンなデータアクセス抽象化
- **CQRS 対応**: コマンドとクエリの分離
- **ドメインイベント**: イベント駆動アーキテクチャサポート

## 🛠️ 開発

### 利用可能なスクリプト

```bash
# 開発
npm run start:dev              # ホットリロード付きで開始
npm run start:debug            # デバッグ付きで開始
npm run start:prod             # 本番モード

# ビルド
npm run build                  # 本番用ビルド

# コード品質
npm run lint                   # 自動修正付き ESLint を実行
npm run format                 # Prettier でコードをフォーマット

# データベース
npm run db:generate            # マイグレーションを生成
npm run db:push                # スキーマ変更をプッシュ
npm run db:studio              # データベース GUI を開く
```

### 環境変数

`.env.example` を `.env` にコピーして設定してください:

```env
# データベース設定
DATABASE_URL=./data/database.sqlite
DATABASE_TYPE=sqlite

# アプリケーション
PORT=3000
NODE_ENV=development
```

## 📁 プロジェクト構造

```
hello_nestjs/
├── src/
│   ├── domain/                # ドメインロジック
│   ├── application/           # アプリケーションサービス
│   ├── infrastructure/        # データアクセス＆外部関心事
│   ├── users/                 # ユーザー機能モジュール
│   ├── app.controller.ts      # メインアプリケーションコントローラー
│   ├── app.module.ts          # ルートモジュール
│   ├── app.service.ts         # アプリケーションサービス
│   └── main.ts                # アプリケーションエントリーポイント
├── test/                      # E2E テスト
├── drizzle.config.ts          # データベース設定
├── nest-cli.json              # NestJS CLI 設定
├── package.json               # 依存関係とスクリプト
├── tsconfig.json              # TypeScript 設定
├── .env.example               # 環境変数テンプレート
├── CLAUDE.md                  # 開発ガイダンス
└── README.md                  # このファイル
```

## 🚀 本番デプロイ

### 本番用ビルド

```bash
# アプリケーションをビルド
npm run build

# 本番サーバーを開始
npm run start:prod
```

### 環境設定

1. `NODE_ENV=production` を設定
2. PostgreSQL データベースを設定
3. 適切な環境変数を設定
4. プロセスマネージャーを設定（PM2、Docker など）

### Docker サポート（オプション）

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📚 学習リソース

このプロジェクトでは以下を実演しています:

- TypeScript での**ドメイン駆動設計**パターン
- **クリーンアーキテクチャ**の原則
- **SOLID** 設計原則
- **テスト駆動開発**の実践
- **モダン NestJS** 開発パターン
- Drizzle での**型安全 ORM** 使用法

## 🤝 コントリビューション

1. リポジトリをフォーク
2. 機能ブランチを作成（`git checkout -b feature/amazing-feature`）
3. テストを実行（`npm test`）
4. 変更をコミット（`git commit -m 'すごい機能を追加'`）
5. ブランチにプッシュ（`git push origin feature/amazing-feature`）
6. プルリクエストを開く

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🙏 謝辞

- [NestJS](https://nestjs.com/) で構築
- [Drizzle ORM](https://orm.drizzle.team/) でデータベースを強化
- [Jest](https://jestjs.io/) でテスト
- [ESLint](https://eslint.org/) と [Prettier](https://prettier.io/) でコード品質を確保

---

**🔥 ハッピーコーディング！** モダンな TypeScript と NestJS パターンで ❤️ を込めて構築。