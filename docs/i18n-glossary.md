# i18n glossary (reviewer reference)

The shared terminology for SC Market and SC Orgs translations, set by the
2026-11 translation quality review. When you add or change a translated string,
use the rendering below. If a term is missing, pick one, apply it to every
existing string that uses the term, and add a row here. One English term gets
one rendering per locale. Never two.

The same file lives in SC Orgs (`sc-orgs-monorepo/docs/i18n-glossary.md`). Keep the two copies identical. The es and
zh-Hant columns apply to SC Market only, and the Dispatch, Intel, Treasury and
AAR rows to SC Orgs only.

English (`en`) is the source of truth. The guards (`check-i18n`,
`i18n-hardcoded --check` and the locale catalog test) check keys, plural forms
and `{{placeholders}}` / `<tags>`. They do not check wording. This file covers
wording.

## Register (fixed per locale)

| Locale | SC Market | SC Orgs | Notes |
|---|---|---|---|
| de | **du** | **du** | Both sites and every email use du. Write du, dich, dir, dein in lower case (capitalised only at the start of a sentence). Never Sie or Ihr for "you". "Sie" for "they" or "it" is fine. "eure Community/Org" is fine for the reader's org as a group. |
| es | **tú** | (no es) | Spain Spanish (añadir, coste, ordenador). Avoid LatAm forms (costo, exitosamente, ingresa). |
| fr | **vous** | **vous** | |
| ja | です/ます | です/ます | Sentences are polite. Buttons, labels and chips use noun or plain forms (保存, 注文する). |
| uk | **ви** (lowercase) | **ви** | Gender-neutral first person where possible. |
| zh-Hans / zh-Hant | **你** | **你** | Not 您. |

## Never translate

Ship, item, manufacturer, commodity and location names (Hurston, New Babbage,
Pyro Gate, Lithium, Quantum Drive, ...). Also aUEC, UEC, SCU, Star Citizen,
RSI, Spectrum, Discord, SC Market, SC Orgs, Citizen Record, and Wikelo.
Field labels in non-Latin locales may wrap RSI terms ("Нікнейм RSI",
"RSI 名称"), because the guard rejects a value identical to English.

**Exception: Star Citizen in zh SEO text.** Chinese players search for
星际公民 / 星際公民, so SEO strings use the Chinese name: page titles, meta
descriptions, hero headings and bodies, SEO intros and leads, and FAQ
questions and answers (SC Market: `landing.seo*`, `landing.hero*`,
`seoAnswers.*`, `missionHubs.*`, `wiki.hub.*`, `storefront.hub.*`; SC Orgs:
`homeHero`, `orgHero`, `eventHero`, `lfo`, `*.metaTitle`, `*.metaDescription`,
the org page title). Write 星际公民 (Star Citizen) (zh-Hant 星際公民 (Star Citizen)) at
the first mention in a title, description, hero, intro or lead, and plain
星际公民 in section headings under a glossed title, FAQ entries and any later
mention in the same string. No 《》. Ordinary
UI text (settings, account linking, admin, onboarding) and the footer keep
"Star Citizen". Ship, item, place and other game names stay in English
everywhere, SEO text included.

## Chinese script and region

- zh-Hans: Simplified characters and mainland terms only.
- zh-Hant: Traditional characters and **Taiwan** terms: 使用者, 設定, 登入/登出,
  建立, 搜尋, 帳號, 儲存, 訊息, 網路, 檔案, 預設, 按讚, 封存. Standard variants:
  為, 群, 裡.
- Quotes: zh-Hans uses “”, zh-Hant uses 「」. The ellipsis is "…".
- Before committing, check the script with OpenCC: no Traditional characters in
  Hans and none of the Simplified-only characters in Hant.

## Core terms

`/` separates related senses. A **bold** cell marks a deliberate choice that
replaced a competing rendering. Do not reintroduce the old one.

| en | de | es | fr | ja | uk | zh-Hans | zh-Hant |
|---|---|---|---|---|---|---|---|
| Market | Markt | mercado | marché | マーケット | **ринок** | **市场** | **市場** |
| Order | Bestellung | pedido | commande | 注文 | замовлення | 订单 | 訂單 |
| Offer | Angebot | oferta | offre | オファー | пропозиція | 报价 | 報價 |
| Listing | **Inserat** (never "Angebot") | anuncio | annonce | 出品 | оголошення | **商品** | **商品** (verb 上架/刊登) |
| Shop | Shop | tienda | boutique | ショップ | магазин | **店铺** (NPC shop 商店) | **商店** |
| Storefront | die Storefront | **escaparate** | vitrine ("vitrine à vos couleurs" = branded) | ストアフロント | вітрина | 店面 | 店面 |
| Stock | Bestand | **stock** ("My Stock" = Mi inventario) | stock | 在庫 | запаси | 库存 | 庫存 |
| Lot | **Los** / Bestandslos | lote | lot | ロット | партія | 批次 | 批次 |
| Buy order | **Kaufauftrag** | orden de compra | ordre d'achat | **買い注文** | **замовлення на купівлю** | **求购单** | **收購單** |
| Price alert | Preisalarm | alerta de precio | alerte de prix | 価格アラート | цінове сповіщення | 价格提醒 | 價格提醒 |
| Watchlist | | | **liste de suivi** | | | | |
| Wishlist / Shopping list | Wunschliste / Einkaufsliste | lista de deseos / lista de compra | liste de souhaits / liste d'achats | ウィッシュリスト / **買い物リスト** | список бажань / список покупок | 心愿单 / 购物清单 | 願望清單 / 購物清單 |
| Cart / Checkout | Warenkorb / Zur Kasse | carrito / finalizar compra | panier / passer la commande | カート / チェックアウト | кошик / оформити замовлення | 购物车 / 结账 | 購物車 / 結帳 |
| Seller / Buyer | Verkäufer / Käufer | vendedor / comprador | vendeur / acheteur | **販売者 / 購入者** | продавець / покупець | 卖家 / 买家 | 賣家 / 買家 |
| Customer | Kunde | cliente | client | 顧客 | **клієнт** | 客户 | 客戶 |
| Contractor | Auftragnehmer | contratista | **prestataire** | コントラクター | **підрядник** | **承包商** | **承包商** |
| Service | **Dienstleistung** | servicio | service | サービス | послуга | 服务 | 服務 |
| Contract | **Auftrag** | contrato | contrat | 契約 | контракт | **合约** | 合約 |
| Bid / Auction | Gebot / Auktion | puja / subasta | enchère | 入札 / オークション | ставка / аукціон | 出价 / 拍卖 | 出價 / 拍賣 |
| Unit price | Stückpreis | precio por unidad | prix unitaire | 単価 | ціна за одиницю | 单价 | 單價 |
| Commodity | Ware (pl. Handelswaren) | materia prima | marchandise | 商品 | **товар** | **大宗商品** | **大宗商品** |
| Fulfil / Fulfilled | erfüllen | **completar** / completado | **honorer / honorée** | 応じる / 完了 | виконати | 完成 | 完成 |
| Being fulfilled (status) | In Bearbeitung | En curso | En cours de traitement | 進行中 | Виконується | 进行中 | 進行中 |
| Queued (status) | In Warteschlange | En cola | En file d'attente | 待機中 | У черзі | 排队中 | 排隊中 |
| Claim (an order) | **übernehmen** | reclamar | **prendre en charge** | **担当する** (never 請求) | **взяти** | 认领 | 認領 |
| Assigned | zugewiesen | asignado | assigné (roles: attribué) | 担当 | призначено | 已指派 | 已指派 |
| Paused / Archived | pausiert / archiviert | en pausa / archivado | en pause / archivé | 一時停止 / アーカイブ | призупинено / **заархівовано** | 已暂停 / 已归档 | 已暫停 / **已封存** |
| Listed (lot) | **Gelistet** | anunciado | en vente | 出品中 | виставлено | 已上架 | 已刊登 |
| Review / Rating | Bewertung | reseña / valoración | avis / note | レビュー / 評価 | відгук / оцінка | 评价 / 评分 | **評價** / 評分 |
| Reputation | Reputation (faction: Ruf) | reputación | réputation | 評判 | репутація | 信誉 (SC Orgs 声誉) | 信譽 |
| Report (moderation) | **Meldung** | **denuncia** | signalement | **報告** | скарга | 举报 | **檢舉** |
| Announcement | Ankündigung | aviso | **communiqué** (not "annonce") | お知らせ | оголошення | 公告 | 公告 |
| Message / DM | Nachricht / DM (Discord-DM) | mensaje / MD | message / **MP** | メッセージ / DM | повідомлення | 消息 / 私信 | 訊息 / 私訊 |
| Discord thread | Thread | hilo | fil | スレッド | **гілка** | **讨论帖** | 討論串 |
| Settings | Einstellungen | **Configuración** | paramètres | 設定 | налаштування | 设置 | 設定 |
| Dashboard | Dashboard | Panel | tableau de bord | ダッシュボード | панель керування | **仪表盘** | 儀表板 |
| Org / Organization | Org (short), Organisation (prose) | org / organización | org / organisation (never "orga") | 組織 (never オーグ) | **організація** (never "орг/орга") | 组织 | 組織 |
| Community (SC Orgs) | Community | comunidad | **communauté** | **コミュニティ** | **спільнота** | **社区** | |
| Member | Mitglied | miembro | membre | メンバー | **учасник** | 成员 | 成員 |
| Role / Permission | Rolle / Berechtigung | rol / permiso | rôle / permission | ロール (function: 役割) / 権限 | роль / дозвіл | 角色 / 权限 (Discord role 身份组) | 角色 / 權限 |
| Rank | Rang | rango | **rang** (not grade) | **ランク** | ранг | **等级** | 等級 |
| Recruiting | Rekrutierung | reclutamiento | recrutement | **募集** | набір | 招募 | 招募 |
| Event | **Event** (not Veranstaltung) | evento | événement | イベント | подія | 活动 | 活動 |
| Dispatch (module / call) | **Einsatzzentrale / Einsatz** | | dispatch | ディスパッチ / **ディスパッチ要請** | Диспетчерська / виклик | 调度 | |
| Intel | **Intel** (recon: Aufklärung) | | renseignement | **情報** | розвідка | 情报 | |
| Treasury | **Kasse** | | trésorerie | **財務** | скарбниця | **金库** | |
| AAR | AAR | | **retex** | 事後報告 | розбір операції | 行动复盘 | |
| Fleet | Flotte | flota | flotte | **フリート** | флот | 舰队 | 艦隊 |
| Ship | Schiff | nave | vaisseau | **艦船** | корабель | **舰船** | **艦船** |
| Item | Artikel (market) / Gegenstand (wiki, game) | **artículo** | article (market) / objet (wiki, game) | アイテム | предмет | 物品 | **物品** |
| Blueprint | Blaupause | **plano** | plan | **設計図** | креслення | 蓝图 | 藍圖 |
| Crafting | **Herstellung** | fabricación | **fabrication** | **クラフト** | **виготовлення** | 制作 | 製作 |
| Wiki / Guide | Wiki / Anleitung | Wiki / guía | wiki / guide | ウィキ / ガイド | вікі / посібник | **百科** / 指南 | 維基 / 指南 |
| Blocklist | **Sperrliste** | lista de bloqueo | liste de blocage | ブロックリスト | список блокування | **屏蔽名单** | 封鎖清單 |
| Audit log | **Prüfprotokoll** | registro de auditoría | journal d'audit | 監査ログ | журнал аудиту | 审计日志 | 稽核日誌 |
| Sign in / out | Anmelden / Abmelden | iniciar / cerrar sesión | se connecter / se déconnecter | **ログイン / ログアウト** | увійти / вийти | 登录 / 退出登录 | 登入 / 登出 |
| Account | Konto | cuenta | compte | アカウント | **обліковий запис** (alt account: альт-акаунт) | 账户 | **帳號** |
| Link an account | verknüpfen | vincular | associer | **連携** | **прив'язати … до** | 关联 | 連結 |
| Verify / Verified | verifizieren / verifiziert | verificar | vérifier / vérifié | 認証済み | **підтвердити / підтверджено** | 验证 / 已验证 | 驗證 / 已驗證 |
| Handle (RSI) | Handle | handle | **pseudo** | ハンドル | **нікнейм** | RSI 名称 (SC Orgs 用户名, never 昵称) | RSI 名稱 |
| Availability | Verfügbarkeit | disponibilidad | disponibilité | **対応可能時間** | доступність | 可用时间 | 可用時段 |
| Two-factor | Zwei-Faktor | dos factores | double authentification | **二要素認証** | двофакторна | 双重验证 | 雙重驗證 |

A blank cell means the term is not used in that catalog, or is used with no
competing rendering. Search the catalog before you introduce a new rendering.

## Permission names

Running text that names a permission must use the translated name from the
roles UI of the same site. Do not use the English ("Manage Webhooks"). In uk,
SC Market permission names are nouns ("Керування ринком") and SC Orgs names are
verbs ("Керувати подіями"). Each site stays consistent with its own list.

## Style checks before committing

- Plurals: write every category the language needs (uk one/few/many/other).
  Never hard-code a `_many` form next to `{{n}}`. Chips like "+{{count}}" use an
  abbreviation ("+{{count}} уч.") when the noun is not plural-aware. ja uses
  counters (件, 個, 人, 回).
- Status chips, tabs and buttons: no longer than about 1.6x the English. Shorten
  them when a natural shorter form exists.
- No English Title Case in de, es, fr or uk. Use sentence case, and write "&"
  out as und / y / et / і.
- When `en` is reworded, retranslate the locale strings too. A stale
  translation is a bug. `git log -p` on the key shows when the English changed.
