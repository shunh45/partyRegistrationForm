const inputAssist = {
    selectingId : -1, //自動入力補完を行う際の選択ID（選択対象が絞れない場合は-1）
    listSelected : false, //入力候補をクリックして選択した場合の処理分岐フラグ
    formInputting : false, //フォームへの内容変更が現在行われているかどうかを判断するフラグ
    nowSelecting : { //現在入力中のテキストボックスを記録する
        type : -1, //入力ボックスのタイプ（-1:未入力 0:ポケモン, 1:twitterID, 2:DiscordID, 3:ハンドルネーム）
        pokeNumber : -1 //何番目のポケモンを選択しているか
    },
    pokeData : [-1, -1, -1, -1, -1, -1], //ポケモンの入力内容についてdexnumを保存
    IDNAME : function(type, pokeNumber = 0){
        //入力ボックスのタイプから、参照するテキストボックスのIDを取得する
        switch(type){
            case 0:
                //ポケモン入力欄
                if (pokeNumber == 0){
                    console.log("ID取得エラー");
                }
                return "ans-p" + pokeNumber;
            case 1:
                //TwitterID入力欄
                return "ans-TwitterID";
            case 2:
                //DiscordID入力欄
                return "ans-DiscordID";
            case 3:
                //ハンドルネーム
                return "ans-hn";
            default:
                //エラー
                console.log("ID取得エラー");
                return "";
        }
    },
    removeList : function(type, pokeNumber = 0){
        //ポケモン名入力候補の位置移動
        const parentBox = document.getElementById("formParent")
        const parentPoint = parentBox.getBoundingClientRect();
        const textBox = document.getElementById(this.IDNAME(type, pokeNumber));
        const boxPoint = textBox.getBoundingClientRect();

        const topPoint = Math.ceil(boxPoint.bottom - parentPoint.top);
        const leftPoint = Math.ceil(boxPoint.left - parentPoint.left);

        const searchList = document.getElementById("formList" + type);
        searchList.style.top = topPoint + "px";
        searchList.style.left = leftPoint + "px";
    },
    inputHelpPoke : function(pokeNumber){
        //ポケモン名入力候補の表示
        const inputText = document.getElementById(this.IDNAME(0, pokeNumber)).value.slice();
        if( inputText === "" ){
            document.getElementById("formList0").style.display = "none";
        }else{
            document.getElementById("formList0").style.display = "block";
            this.removeList(0, pokeNumber);
        }
        let selectBoxes = 0;
        let listing;
        let i;
        let perfect = -1; // 完全一致判定
        // 平仮名参照検索
        for( i=0; i<POKE_LISTMAX; i++ ){
            listing = document.getElementById("formList0_" + i);
            if((listing.dataset.nameh).startsWith(inputText)){
                listing.style.display = "block";
                selectBoxes++;
                this.selectingId = +listing.dataset.id;
                if( selectBoxes > 5 ) break;
            }else{
                listing.style.display = "none";
            }
        }
        if( selectBoxes == 0 ){
            // 汎参照検索
            for( i=0; i<POKE_LISTMAX; i++ ){
                listing = document.getElementById("formList0_" + i);
                if(listing.innerText.startsWith(inputText)){
                    listing.style.display = "block";
                    selectBoxes++;
                    this.selectingId = +listing.dataset.id;
                    if( listing.innerText === inputText ){
                        perfect = +listing.dataset.id;
                    }
                    if( selectBoxes > 5 ) break;
                }else{
                    listing.style.display = "none";
                }
            }
        }
        for( ; i<POKE_LISTMAX; i++) document.getElementById("formList0_" + i).style.display = "none";
        if( perfect != -1 ){
            // 完全一致
            this.selectingId = perfect;
        }else if( selectBoxes != 1 ){
            this.selectingId = -1;
        }
    },
    inputHelpID : function(){
        //TwitterIDの入力補助
        let inputText = document.getElementById(this.IDNAME(1)).value.toLowerCase();
        if( inputText[0] == "@" ) inputText = inputText.slice(1).toLowerCase();
        if( inputText === "" ){
            document.getElementById("formList1").style.display = "none";
        }else{
            document.getElementById("formList1").style.display = "block";
            this.removeList(1);
        }
        let selectBoxes = 0;
        let listing;
        let i;
        let perfect = -1; // 完全一致判定
        // 汎参照検索
        for( i=0; i<USER_LISTMAX; i++ ){
            listing = document.getElementById("formList1_" + i);
            if(listing.dataset.search.startsWith(inputText)){
                listing.style.display = "block";
                selectBoxes++;
                this.selectingId = +listing.dataset.id;
                if( listing.dataset.search === inputText ){
                    perfect = +listing.dataset.id;
                }
                if( selectBoxes > 5 ) break;
            }else{
                listing.style.display = "none";
            }
        }
        for( ; i<USER_LISTMAX; i++) document.getElementById("formList1_" + i).style.display = "none";
        if( perfect != -1 ){
            // 完全一致
            this.selectingId = perfect;
        }else if( selectBoxes != 1 ){
            this.selectingId = -1;
        }
    },
    killLists : function(){
        //入力候補リストの全消去
        document.getElementById("formList0").style.display = "none"; //ポケモン名
        if (USE_TWITTERFORM) document.getElementById("formList1").style.display = "none"; //TwitterID名
    },
    setInformation(type, pokeNumber = 0, selectId){
        //入力データ決定・登録
        const textBox = document.getElementById(this.IDNAME(type, pokeNumber));
        const select = document.getElementById("formList" + type + "_" + selectId);
        switch(type){
            case 0:
                //ポケモン
                if ( selectId != -1 ){
                    let pokedexNum = Number(select.dataset.dexnum);
                    if ( !POKE_REPEATED && ![-1, pokeNumber-1].includes(this.pokeData.indexOf(pokedexNum)) ){
                        //重複入力を弾く
                        textBox.value = "";
                        this.pokeData[pokeNumber-1] = -1;
                    }else {
                        textBox.value = select.innerHTML;
                        this.pokeData[pokeNumber-1] = pokedexNum;
                    }
                }else {
                    //異常入力を弾く
                    textBox.value = "";
                    this.pokeData[pokeNumber-1] = -1;
                }
                break;
            case 1:
                //TwitterID
                if ( selectId != -1 ){
                    textBox.value = select.dataset.twitterid;
                    if(USE_DISCORDFORM) document.getElementById(this.IDNAME(2)).value = select.dataset.discordid;
                    if(HN_AUTOCOMPLETE) document.getElementById(this.IDNAME(3)).value = select.dataset.name;
                }else {
                    textBox.value = "";
                }
                break;
            default:
                console.log("データ登録エラー");
        }
    },
    selectList : function(setId){
        //onclick:リスト選択時の実行関数
        this.setInformation(this.nowSelecting.type, this.nowSelecting.pokeNumber, setId);
        this.listSelected = true;
        this.selectingId = -1;
        this.nowSelecting.pokeNumber = -1;
        this.nowSelecting.type = -1;
        this.killLists();
    },
    finishSelect : function(type, pokeNumber = 0){
        //onchange:入力完了関数
        if( this.selectingId != -1 ){
            //入力候補が一つの場合、選択
            this.setInformation(type, pokeNumber, this.selectingId);
        }else{
            if ( this.listSelected ){
                this.listSelected = false;
            }else if( this.formInputting ) {
                //異常な入力内容に対する補完
                this.setInformation(type, pokeNumber, -1);
            }
        }
        //未入力状態に
        this.formInputting = false;
        this.selectingId = -1
        this.nowSelecting.pokeNumber = -1;
        this.nowSelecting.type = -1;
        this.killLists();
    },
    dmInput : function(type, pokeNumber = 0){
        //oninput:入力途中関数
        this.formInputting = true;
        this.nowSelecting.pokeNumber = pokeNumber;
        this.nowSelecting.type = type;
        if ( type == 0 ){
            this.inputHelpPoke(pokeNumber);
        }else if( type == 1 ){
            this.inputHelpID();
        }
    },
    atmatkExlarge(fn){
        //自由記述欄の文頭半角@を、全角＠に置き換える
        const Element = FreeFormBoxes[fn];
        let text = Element.value;
        if ( text != "" && text[0] === '@' ){
            Element.value = "＠" + text.substr(1);
        }
    },
    blurForFreebox(fn){
        //自由記述欄について、onChangeでフォーカスを外す
        FreeFormBoxes[fn].blur();
    },
    blurFromChange(type, pokeNumber = 0){
        //onChangeでフォーカスを外す
        document.getElementById(this.IDNAME(type, pokeNumber)).blur();
    }
}

for (let i=1; i<=6; i++){
    document.getElementById(inputAssist.IDNAME(0,i)).addEventListener("input", () => {inputAssist.dmInput(0,i);})
    document.getElementById(inputAssist.IDNAME(0,i)).addEventListener("blur", () => {inputAssist.finishSelect(0,i);})
    document.getElementById(inputAssist.IDNAME(0,i)).addEventListener("change", () => {inputAssist.blurFromChange(0,i);})
}
if (USE_TWITTERFORM){
    document.getElementById(inputAssist.IDNAME(1)).addEventListener("input", () => {inputAssist.dmInput(1);})
    document.getElementById(inputAssist.IDNAME(1)).addEventListener("blur", () => {inputAssist.finishSelect(1);})
    document.getElementById(inputAssist.IDNAME(1)).addEventListener("change", () => {inputAssist.blurFromChange(1);})
}
if (HN_AUTOCOMPLETE){
    document.getElementById(inputAssist.IDNAME(3)).addEventListener("focus", () => {inputAssist.blurFromChange(3);})
}
const FreeFormBoxes = document.getElementsByClassName("atexlarge");
for ( let i=0; i<FreeFormBoxes.length; i++ ){
    FreeFormBoxes[i].addEventListener("blur", () => {inputAssist.atmatkExlarge(i);})
    FreeFormBoxes[i].addEventListener("change", () => {inputAssist.blurForFreebox(i);})
}