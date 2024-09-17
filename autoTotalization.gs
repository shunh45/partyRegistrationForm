function autoKP() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const rawForm = spreadsheet.getSheetByName('form');
  const readingForm = spreadsheet.getSheetByName('Imput');
  const wrightingKP = spreadsheet.getSheetByName('KP');

  // 集計結果の削除
  readingForm.getRange("B3:I300").clear();
  wrightingKP.getRange("A1:E300").clear();
  wrightingKP.getRange("A1").setValue("順位");
  wrightingKP.getRange("B1").setValue("ポケモン");
  wrightingKP.getRange("C1").setValue("KP");
  wrightingKP.getRange("D1").setValue("予選抜け数");
  wrightingKP.getRange("E1").setValue("TOPCUT");

  // formデータ識別子の読み取り
  const imputColumns = ["D", "E", "F", "G", "H", "I"];
  const makeDataNameStatus = (imputColumn) => {
    const cellValue = readingForm.getRange(imputColumn+"2").getValue();
    //const cellValue = readingForm.getRange(cellID).getValue();
    if (cellValue == ""){
      // フォーム上に項目がない場合は空欄にし、読み取りを行わない
      return {valid:false}
    }else{
      // formタブ上での該当列を特定する
      for (let col=0; col<14; col++){
        const formColumn = "ABCDEFGHIJKLMN"[col];
        if (cellValue === rawForm.getRange(formColumn + "1").getValue()){
          return {
            valid : true,
            formCol : formColumn,
            imputCol : imputColumn,
            name : cellValue
          }
        }
      }
      // 該当列が見つからなかったとき
      return {
        valid : false,
        name : cellValue
      }
    }
  };
  const dataName = {
    name : makeDataNameStatus("B"),
    id : makeDataNameStatus("C"),
    poke : imputColumns.map((col, _) => makeDataNameStatus(col))
  };

  // formからImputへの転記
  const copyRow = (dataNameElement) => {
    const { formCol, imputCol } = dataNameElement;
    readingForm.getRange(`${imputCol}3:${imputCol}301`).setValues(
      rawForm.getRange(`${formCol}2:${formCol}300`).getValues()
    );
  };
  if (dataName.name.valid) copyRow(dataName.name);
  try {
    if (dataName.id.valid){
      copyRow(dataName.id);
    }else {
      throw "Imput-C2に識別IDのデータ名を正確に入力してください";
    }
    for (let p=0; p<6; p++){
      if (dataName.poke[p].valid){
        copyRow(dataName.poke[p]);
      }else {
        throw `Imput-${imputColumns[p]}2にポケモン${p}のデータ名を正確に入力してください`;
      }
    }
  }catch (error){
    console.log(error);
    Browser.msgBox(error);
    return 1; // 強制終了
  }

  Pokes = {}
  KP = {};

  let row = 3;
  let gap = 0;
  while( true ){
    const twitterId = readingForm.getRange("C"+row).getValue();
    if( twitterId == "" ){
      gap += 1;

    }else {
      let party = {
        win : false,
        poke : ["", "", "", "", "", ""]
      }
      let valid = true;

      party.win = readingForm.getRange("A"+row).getValue() || Pokes[twitterId]?.win;

      // 申請内容の読み取り
      for ( let i=0; i<6; i++ ){
        const pokemon = readingForm.getRange(imputColumns[i]+row).getValue();
        if ( pokemon == "" ){
          valid = false;
          break;
        }else {
          party.poke[i] = pokemon;
        }
      }

      if ( valid ){
        // ポケモンの登録
        Pokes[twitterId] = party;
      }else {
        gap += 1;
      }
    }

    // 不完全な行が5行以上続いた時点で集計を終了する
    if ( gap > 4 ){
      break;
    }
    row += 1;
  }

  //KPの集計
  for( let key in Pokes ){
    const party = Pokes[key];
    if ( party.win ){
      party.poke.forEach( (pokemon) => {
        if ( pokemon in KP ){
          KP[pokemon][0] += 1;
          KP[pokemon][1] += 1;
        }else {
          KP[pokemon] = [1, 1];
        }
      });
    }else {
      party.poke.forEach( (pokemon) => {
        if ( pokemon in KP ){
          KP[pokemon][0] += 1;
        }else {
          KP[pokemon] = [1, 0];
        }
      });
    }
  }

  // 集計結果の整理
  result = [];
  for ( let key in KP ){
    result.push([key, KP[key][0], KP[key][1], 100*KP[key][1]/KP[key][0]]);
  }
  result.sort( (a,b) => a[0]<=b[0]? -1:1 ); // 五十音順に並び替える
  result.sort( (a,b) => a[1]>b[1]? -1:1 ); // KP順に並び替える

  for( let i=0; i<result.length; i++ ){
    const pokemon = result[i];
    wrightingKP.getRange("A"+(i+2)).setValue(i+1);
    wrightingKP.getRange("B"+(i+2)).setValue(pokemon[0]);
    wrightingKP.getRange("C"+(i+2)).setValue(pokemon[1]);
    wrightingKP.getRange("D"+(i+2)).setValue(pokemon[2]);
    wrightingKP.getRange("E"+(i+2)).setValue("=rounddown(" + pokemon[3] + ",2)");
  }
}

function onOpen() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let menuEntries = [];
  menuEntries.push({ name: "実行", functionName: "autoKP" });

  ss.addMenu("自動KP集計", menuEntries);
}
