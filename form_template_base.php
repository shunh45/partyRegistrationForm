<?php

// データベース接続
include('db_access_X29.php');
$pdo->query('SET NAMES utf8;');
// SQL
//基本情報取得
$offStmt = $pdo->prepare('SELECT * FROM offAdmin');
$offStmt->execute();
$offData = $offStmt->fetchAll();

$row = $offData[$formPageID];
//オフの基本情報
$offValid = $row["valid"];
$offName = $row["name"];
$offDate = $row["date"];

//使用機能の選択
$UseTwitter = $row["useTwitter"];
$UseDiscord = $row["useDiscord"];
$HnAutoComplete = $row["HnAutoComplete"];
$pokeSame = $row["samePokePermission"];
$nameWithID = $row["nameWithID"];

$isRaigeki = $row["isRaigeki"];


// ポケモン
$dbname = "pokeList";
$pokeStmt = $pdo->prepare('SELECT * FROM ' . $dbname);
$pokeStmt->execute();
$poke = $pokeStmt->fetchAll();

// 参加者リスト
$dbnameU = "userList_" . $formPageID;
$userStmt = $pdo->prepare('SELECT * FROM ' . $dbnameU);
$userStmt->execute();
$user = $userStmt->fetchAll();

// 切断
unset($pdo);

//入力補助の無効化判定
$modeNoAssist = 0;
if( isset($_GET['NoAssist']) ){ //入力補助自体の無効化
    $modeNoAssist = 1;
}

if( isset($_GET['PageData']) ){ //ページデータの参照とページ出力の切り替え
    ?>
    <h2>No.<? echo $formPageID ?>（<? echo( $offValid ? "登録済み" : "未登録" ) ?>）</h2>
    <ul>
        <li>オフ名称： <? echo $offName ?></li>
        <li>開催日： <? echo $offDate ?></li>
        <li>ページデザイン： <? echo( $isRaigeki ? "雷撃ベース" : "デフォルト" ) ?></li>
        <li>TwitterIDの入力補助： <? echo( $UseTwitter ? "有効" : "無効" ) ?></li>
        <li>ハンネの自動入力： <? echo( $HnAutoComplete ? "有効" : "無効" ) ?></li>
        <li>DiscordIDの自動補完： <? echo( $UseDiscord ? "有効" : "無効" ) ?></li>
        <li>TwitterIDではなくハンネ＠IDを送信する（調整中）： <? echo( $nameWithID ? "有効" : "無効" ) ?></li>
        <li>同一ポケモンの入力： <? echo( $pokeSame ? "許容" : "禁止" ) ?></li>
    </ul>
    <p></p>
    <h2>登録状況</h2>
    <ul>
        <? $rown = 0; foreach( $offData as $row ){ ?>
        <li>No.<? echo $rown++; ?>： <? echo $row["name"]; ?></li>
        <? } ?>
    </ul>
    <?
}else {

get_header(); ?>

<? //フォームの連続送信防止
?>
<script type="text/javascript">
$(function () {
//二重送信抑制
	let submitBtn = $("input[type='submit'].wpcf7-submit");
	submitBtn.click(function () {
		$(this).css('pointer-events', 'none');
		$(this).css('opacity', '0.5');
	})
	// 入力項目にエラーがあったらボタン復活
	document.addEventListener('wpcf7invalid', function () {
		submitBtn.css('pointer-events', 'auto');
		submitBtn.css('opacity', '1');
	}, false);
    // 送信完了
    document.addEventListener( 'wpcf7mailsent', function() {
        document.getElementById("reload").style.display = "block";
        const H2Elements = document.getElementsByClassName("partyformH2");
        console.log(H2Elements);
        for( let i=0; i<H2Elements.length; i++ ) H2Elements[i].style.display = "none";
    }, false );
});
</script>
 
<div id="primary" class="content-area">
	<main id="main" class="site-main" role="main">
        <style type="text/css">
            <? if( $isRaigeki == 0 ){ ?>
            /* ページ下部のデザイン調整 */
            form.sent p{
                display:none;
            }
            #reload{
                display: none;
                text-align: right;
            }
            #reload a{
                display: inline-block;
                padding: 8px 15px;
                font-size: 80%;
                background-color: #f5f8fa;
                border: solid 1px #dddddd;
                color: #282828;
                cursor: pointer;
                text-decoration: none;
            }
            select{
                background: #ffffff !important;
                padding-top:10px;
                padding-bottom:10px;
                -webkit-appearance: none;
            }
            h2.partyformH2{
                margin-top: 70px !important;
            }
            /* 外部オフ向けのデザイン調整 */
            body.custom-background{
                background: #eee !important;
            }
            #menu-mobile_menu{
                display: none;
            }
            #main{
                background: #fefefe;
            }
            h1.entry-title{
                color: #202020;
                text-align: left;
                font-size: 150%;
            }
            h1.entry-title{ padding: 29px }
            @media screen and (max-width: 834px){
                h1.entry-title{ padding: 16px }
            }
            <? } //外部オフかどうかの判定 ?>
            /* ポケモンリスト用のCSS */
            #formParent{
                position: relative;
            }
            .formList{
                margin: 0;
                padding: 0;
                display: none;
                position: absolute;
                z-index: 1;
                width: 13em;
                background-color: #ffffff;
                text-align: center;
                border: solid 1px #eee;
            }
            .formList ul{
                padding: 0;
                margin: 0;
            }
            .formList li{
                position: relative;
                margin: 2px 0 2px 4px;
                border-left: solid 3px #eee;
                font-size: 19px;
                line-height: 23px;
                padding: 2px 0 2px 1px;
                text-align: left;
                color: #303030;
                cursor: pointer;
            }
            .formList li:hover{
                background-color: #f7f7f7;
            }
            .formList_row{
                display: flex;
            }
            .formList_row input{
                color: #ffffff;
                border: none;
                margin: 1px;
            }
            .formList_row input:hover{
                background: #2a2a2a !important;
            }
            #formList1{
                width: 18em;
            }
            #formList1 li{
                white-space: nowrap;
                overflow-x: hidden;
            }
            .formListSubname{
                font-size: 70%;
                color: #bbb;
            }
        </style>
        <div id="formParent" style="margin:0; padding:0">
            <?php get_template_part('tmp/content'); ?>
            <? if( $modeNoAssist == 0 ){ //入力補助の無効化判定 ?>

            <div class="formList"  id="formList0">
                <ul>
                    <? // 検索リスト（ポケモン）
                    $pokeNum = 0;
                    foreach( $poke as $row ){ 
                        if ($row['use'] == 0) continue;
                        $name = $row['name'];
                        $dexNum = $row['id']; //図鑑ナンバー
                        $nameDec = mb_convert_kana($name,'c'); //ポケモン名のひらがな ?>
                            <li id="formList0_<?echo $pokeNum;?>" data-id=<?echo $pokeNum;?> data-nameh="<?echo $nameDec;?>" data-dexnum="<?echo $dexNum;?>" onmousedown="inputAssist.selectList(<?echo $pokeNum;?>);"><?echo $name;?></li>
                    <? $pokeNum += 1; } ?>
                </ul>
            </div>
            <? $userNum = 0;
               if($UseTwitter){ // TwitterID検索リスト?>
            <div class="formList" id="formList1">
                <ul>
                    <? // 検索リスト（Twitter）
                    foreach( $user as $row ){ 
                        if ($row['use'] == 0) continue;
                        $name = htmlspecialchars($row['name'], ENT_QUOTES, 'UTF-8');
                        $twitterID = htmlspecialchars(mb_convert_kana($row['TwitterID'], "KVa"), ENT_QUOTES, 'UTF-8'); //TwitterID
                        if ( $twitterID[0] == '@' ){
                            $twitterIDnoat =  htmlspecialchars(strtolower(substr($twitterID, 1)), ENT_QUOTES, 'UTF-8');
                        }else {
                            $twitterIDnoat =  htmlspecialchars(strtolower(substr($twitterID, 0)), ENT_QUOTES, 'UTF-8');
                            $twitterID = "@" . $twitterID;
                        }
                        $discordID = htmlspecialchars(mb_convert_kana($row['DiscordID'], "KVa"), ENT_QUOTES, 'UTF-8'); //discordID ?>
                            <li id="formList1_<?echo $userNum;?>" data-id=<?echo $userNum;?> data-search="<?echo $twitterIDnoat;?>" data-twitterid="<?echo $twitterID;?>" data-discordid="<?echo $discordID;?>" data-name="<?echo $name;?>" onmousedown="inputAssist.selectList(<?echo $userNum;?>);"><?echo $twitterID;?><span class="formListSubname"> <?echo $name;?></span></li>
                    <? $userNum += 1; } ?>
                </ul>
            </div>
            <? } //TwitterIDの使用判定 ?>
            <? } //入力補助の無効化判定 ?>
        </div>
    <? // JavaScript ?>
	</main><!-- .site-main -->
 
	<?php //get_sidebar( 'content-bottom' ); ?>
 
</div><!-- .content-area -->
 
<?php // get_sidebar(); ?>
    <? if( $modeNoAssist == 0 ){ //入力補助の無効化判定 ?>
    <script>
        const POKE_LISTMAX = <? echo $pokeNum ?>;
        const USER_LISTMAX = <? echo $userNum ?>;
        const USE_TWITTERFORM = <? echo $UseTwitter ?>; //TwitterIDの使用フラグ
        const USE_DISCORDFORM = <? echo $UseDiscord ?>; //discordIDの使用フラグ
        const HN_AUTOCOMPLETE = <? echo $HnAutoComplete ?>; //TwitterIDからハンネを自動補完するフラグ
        const POKE_REPEATED = <? echo $pokeSame ?>; //ポケモンの重複入力を管理するフラグ
    </script>
    <script src="https://volt-strike.com/js/inputAssist.js?20240320"></script>
    <? } //入力補助の無効化判定 ?>

<?php get_footer(); ?>

<? } //ページデータの参照とページ出力の切り替え ?>