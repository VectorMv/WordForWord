﻿$(document).ready(function () {

    let Words = [];
    let DisplayWords = [];

    let Keyword = '';
    let KeyWordSet;

    let MAX_KEYWORD_LENGTH = 15;
    let MIN_KEYWORD_LENGTH = 4;
   
    //Поиск слов по ключевому слову
    $('#get-words-form').submit(function () {

        Reset()

        Keyword = $('#get-keyword').val().toLowerCase().trim()

        if (!CheckInputValue()) {
            return false;
        }

        KeyWordSet = new Set(Keyword.split(''))

        $.ajax({
            type: 'GET',
            url: window.location.pathname,
            dataType: 'json',
            data: {
                handler: "WordsResult",
                keyWord: Keyword
            },
            success: function (data) {

                AfterGettingResults(data)
            }
        })
      
        return false;
    });



    /*KEY WORD-------------------------------------------------------------------------------------------*/

    //Валидация для ключевого слова
    function CheckInputValue() {

        if (!CheckMinKeyWordLength()) {
            return false;
        }

        if (Keyword.length > MAX_KEYWORD_LENGTH) {
            $('#input-Keyword-error').text("Максимум 15 букв")
            return false;
        }

        let expr = /^[а-яa-z]+$/i

        if (!expr.test(Keyword)) {

            EditKeyValue();
            $('#get-keyword').val(Keyword)

            return CheckMinKeyWordLength();
        }

        return true;

    }

    //Проверка на минимальную длину ключевого слова
    function CheckMinKeyWordLength() {

        if (Keyword.length < MIN_KEYWORD_LENGTH) {
            $('#input-Keyword-error').text("Минимум 4 буквы")
            return false;
        }

        return true
    }

    //Редактирование ключеваого слова
    function EditKeyValue() {
        let exprInt = /^\d+$/i

        let keyValueArr = Keyword.split('')

        keyValueArr = keyValueArr.filter(function (item) {
            return !exprInt.test(item);
        });

        let temp = keyValueArr.join('');
        Keyword = temp;

        return;
    }

    /*KEY WORD-------------------------------------------------------------------------------------------*/



    //Действия после получения набора слов из базы данных
    function AfterGettingResults(data) {

        if (InsertData(data)) {

            //SetFillword();
            //CreateListWordsForSudoku();
            //CreateListWordsForCrossword();
            CreateListWordsForChess();
            //console.log("конец AfterGettingResults")

        }
        else {

            console.log("Ошибка")
        }


    }

    
    function InsertData(data) {

        var tempArr = CreateWordsSet(data)

        //------------------
        DisplayWords = tempArr.slice();

        for (var i = 0; i < tempArr.length; i++) {
            $('#search-result').append('<h6>' + tempArr[i] + '</h6>')
        }

        for (var i = 2; ; i++) {

            temp = tempArr.filter(item => item.length == i);

            if (temp.length !== 0) {
                Words['|' + i + '|'] = temp
            }

            if (i == MAX_KEYWORD_LENGTH) {
                break;
            }
        }

        if (CheckWodsForRequiredValues()) {
            return true
        }

        console.log('InsertData')
        console.log(Words)

        return false;
    }

    //Создание массива всех слов из полученных данных
    function CreateWordsSet(data){

        let WordsSet = []

        for (var i = 0; i < data.length; i++) {
            WordsSet[i] = data[i].word
        }

        return WordsSet;
    }

    function CheckWodsForRequiredValues() {

        if (Words['|4|'] == undefined) {
            console.log("Отсутствуют слова из 4 букв")

            return false;
        }

        let requiredCount = 0;

        for (var i = 7; i > 0; i--){

            if (Words['|' + i + '|'] !== undefined) {
                requiredCount += Words['|' + i + '|'].length;
            }
        }

        if (requiredCount < 6) {
            console.log("Недостаточно слов")

            return false;
        }

        return true;
    }



    var FillWordValues = []

    //Заливка Филворда
    function SetFillword() {

        ClearTable('#table-res');

        FillWordValues = Words.filter(item => item.length <= 7)

        //if (FillWordValues.length < 2 || FillWordValues === undefined) {

        //    FillWordValues = Words.filter(item => item.length >= 4 && item.length <= 7)

        //}

        let firstStepValues = FillWordValues.filter(item => item.length >= 5)


        

        if (firstStepValues.length >= 2) {

            let randomRow
            let randomArrValue

            let temp1 = -1
            let temp2 = -1

            for (let i = 0; i < 2; i++) {

                randomRow = getRandomInt(4)
                randomArrValue = getRandomInt(firstStepValues.length)

                if (temp1 === randomRow) {
                    temp1 += 1

                    if (temp1 > 3) {

                        temp1 = 0
                    }
                } else {

                    temp1 = randomRow
                }

                if (temp2 === randomArrValue) {
                    temp2 += 1

                    if (temp2 > firstStepValues.length - 1) {

                        temp2 = 0
                    }
                } else {

                    temp2 = randomArrValue
                }

                SetTableRow(temp1, firstStepValues[temp2])

            }
           

        }

        console.log(FillWordValues)
       
        console.log("конец SetFillword")

    }

    //Очистка таблицы от значений
    function ClearTable(table) {

        $(table + ' tr > td > input').each(function (indx, element) {
            $(this).attr("value", ' ')
        });
    }

    //Запись слова в строку
    function SetTableRow(row, word) {

        let randomVal

        switch (word.length) {

            case 5: {
                randomVal = getRandomInt(3);
                break;
            }
            case 6: {
                randomVal = getRandomInt(2);
                break;
            }
            case 7: {
                randomVal = 0;
                break;
            }

        }

        let i = 0;

        $('#table-res tr:eq(' + row + ') > td > input').each(function (indx, element) {

            if (i == word.length) {
                return;
            }

            if (indx >= randomVal) {
                $(this).attr("value", word[i]);
                i++        

            }
        });

    }


    function Reset() {
        $('#crossword').empty()
        $('#crossword-values').empty();
    }

    /*SUDOKU START---------------------------------------------------------------------------------------*/

    let WordsForSudoku = []

    //Создание списка слов для судоку
    function CreateListWordsForSudoku() {

        //console.log('CreateListWordsForSudoku')
        //console.log(DisplayWords)

        WordsForSudoku = DisplayWords.filter(function (item) {
            return item.length == 4;
        })

        if (WordsForSudoku.length == 0) {
            //Нет необходимых значений
            return false;
        }


        $('#sudoku-values').empty();
        let list = $('#sudoku-values')

        for (var i = 0; i < WordsForSudoku.length; i++) {
            list.append("<li>" + WordsForSudoku[i] +"</li>")
        }

        SetSudoku(WordsForSudoku[0])

        return false;
    }

    //Очистка значений таблицы судоку
    function ClearSudokuTable() {
        $('#table-sudoku tr > td > input').each(function (indx, element) {
            $(this).val(' ');
        });
    }

    //Формирование значений для судоку
    function SetSudoku(value) {

        ClearSudokuTable() 
        
        const ROWS = 4
        const COLUMS = 4
        const DONTMOVE = 1

        let inputs = $('#table-sudoku tr > td > input');
        var valueArr = value.split('');
        console.log(valueArr)

        inputs[0].value = valueArr[0];
        inputs[5].value = valueArr[0];
        inputs[10].value = valueArr[1];
        inputs[15].value = valueArr[2];
        inputs[12].value = valueArr[3];

        let curRowValues = []
        let tempArr = []
        let currentRow = 0;
        
        for (var i = 0, z = 0; i < ROWS; i++) {

            for (var j = 0; j < COLUMS; j++) {
                curRowValues[j] = inputs[z].value;
                z++;            
            }


            tempArr = []

            valueArr.forEach(function (item, index) {
                tempArr[index] = item;
            });

            let temp;
            let index;

            for (var a = 0; a < ROWS; a++) {

                temp = curRowValues[a]

                for (var b = 0; b < COLUMS; b++) {

                    if (temp == tempArr[b]) {

                        index = tempArr.indexOf(temp);
                        tempArr.splice(index, 1);
                        break;
                    }

                }
            }

            if (i != DONTMOVE) {

                tempArr.push(tempArr.shift())
            }

            for (var c = COLUMS * currentRow, fC = 0, tt = 0; tt < COLUMS; c++, tt++) {

                if (inputs[c].value == ' ') {
                    inputs[c].value = tempArr[fC]
                    fC++;
                }
            }
   
            currentRow++;
        }
    }

    /*SUDOKU END-----------------------------------------------------------------------------------------*/



    /*CROSSWORD START------------------------------------------------------------------------------------*/

    let WordsForCrossword = []

    //Создание списка слов для кроссворда
    function CreateListWordsForCrossword() {

        WordsForCrossword = DisplayWords.filter(function (item) {
            return item.length >= 5 && item.length <= 8;
        });

        $('#crossword-values').empty();
        let list = $('#crossword-values')

        for (var i = 0; i < WordsForCrossword.length; i++) {
            list.append("<li>" + WordsForCrossword[i] + "</li>")
        }

        for (var i = 0; i < WordsForCrossword.length; i++) {
            let res = CreateCrossword(WordsForCrossword[i]);

            if (!res) {
                WordsForCrossword.splice(i, 1);
                i--;
            } else {
                return true;
            }
        }

        console.log("Не удалос создать кроссворд")
        return false;
    }

    //Создание кроссворда
    function CreateCrossword(secretWord) {
      
        //console.log('CreateCrossword----------------------------')
        //console.log(secretWord)

        $('#crossword').empty()

        let RightWordsForCrossword = DisplayWords.filter(function (item) {
            return item.length <= 7;
        });

        let delIndx = RightWordsForCrossword.indexOf(secretWord);
        RightWordsForCrossword.splice(delIndx, 1);

        Shuffle(RightWordsForCrossword)

        let crossword = $('#crossword');
        crossword.append('<table><tbody></tbody></table>')

        for (var i = 0; i < secretWord.length; i++) {

            let completed = AddRowToCrossword(crossword, secretWord[i], RightWordsForCrossword)

            if (!completed) {
                console.log("Не удалось создать кроссворд")
                return false;
            }       
        }

        return true;
    }

    //Заполнение строки в кроссворде
    function AddRowToCrossword(crossword, letter, array) {

        //console.log('AddRowToCrossword')
        //console.log(letter)

        let word;
        let indxLetter;

        for (var i = 0; i < array.length; i++) {

            word = array[i];
            indxLetter = FindIndexes(letter, word);
            //console.log(indxLetter)

            if (indxLetter == -1 || indxLetter > 3 || (word.length - (indxLetter + 1)) > 3) {
                continue;
            }

            array.splice(i, 1);

            //console.log(word)

            let wordStart = 3 - indxLetter;
            let wordEnd = wordStart + (word.length - 1);

            $('#crossword > table > tbody').append('<tr></tr>')

            let currentRow = crossword.find("tr:last")

            for (var j = 0, l = 0; j < 7; j++) {

                if (j >= wordStart && j <= wordEnd) {

                    currentRow.append('<td class="ttt">' + word[l] + '</td>')
                    l++;
                }
                else {
                    currentRow.append('<td ></td>')
                }
            }
            return true;
        }
        return false;
    }

    //Поиск буквы в слове
    function FindIndexes(letter, word) {
        let result = [];
        let indx = word.indexOf(letter);

        while (indx != -1) {
            result.push(indx);
            indx = word.indexOf(letter, indx + 1);

            if (indx > 3) {
                break;
            }
        }

        //console.log(word)
        //console.log(result)

        if (result.length == 1) {
            return result[0];
        }
        else if (result.length == 0) {
            return - 1;
        }
        else if (result.length > 1) {
            return result[getRandomInt(result.length)]
        }

        return -1;
    }

    /*CROSSWORD END--------------------------------------------------------------------------------------*/



    /*CHESS START----------------------------------------------------------------------------------------*/

    let WordsForChess = []
    let Rook_Direction = Object.freeze(['RIGHT', 'LEFT', 'UP', 'DOWN' ])
    let Bishop_Direction = Object.freeze(['RIGHT-DOWN', 'LEFT-UP', 'LEFT-DOWN', 'RIGHT-UP' ])

    let ChessMatrix = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],]

    //Сброс матрицы
    function ResetChessMatrix() {
        for (var i = 0; i < ChessMatrix.length; i++) {

            for (var j = 0; j < ChessMatrix[i].length; j++) {
                ChessMatrix[i][j] = 0;
            }

        }
    }

    //Создание списка допустимых слов для "шахмат"
    function CreateListWordsForChess() {
        console.log('CreateListWordsForChess');

        ResetChessMatrix()

        WordsForChess = DisplayWords.filter(function (item) {
            return item.length >= 5 && item.length <= 8;
        });

        $('#сhess-values').empty();
        let list = $('#сhess-values')

        for (var i = 0; i < WordsForChess.length; i++) {
            list.append("<li>" + WordsForChess[i] + "</li>")
        }

        CreateChess(WordsForChess[0]);
        //CreateChess('икринка');
    }


    let figureX;
    let figureY;

    //
    function CreateChess(word, figure = 'bishop') {

        ResetChessMatrix()

        figureX = getRandomInt(8);
        figureY = getRandomInt(8);

        if (figure == 'rook') {
            Rook(word);
            return
        }

        if (figure == 'bishop') {
            Bishop(word)
            return
        }
        

    }




    /*BISHOP START---------------------------------------------------------------------------------------*/

    //Слон
    function Bishop(word) {

        let lastX = figureX;
        let lastY = figureY;

        let needFill = false;

        Bishop_PrepareField()

        let letter;
        let choice = 4;

        let res = Bishop_CheckStartPosition(figureX, figureY);

        if (res == -1) {
            res = getRandomInt(choice);
            needFill = true;
        }

        ChessMatrix[figureY][figureX] = -5;

        Bishop_ShiftFigure(res, word[0]);

        if (needFill) {

            if (res == 0 || res == 1) {

                if (lastX !== 7 && lastY !== 0) {

                    for (var i = lastY - 1, j = lastX + 1; ; i-- , j++) {
                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 0 || j == 7) {
                            break;
                        }
                    }

                }

                if (lastX !== 0 && lastY !== 7) {

                    for (var i = lastY + 1, j = lastX - 1; ; i++ , j--) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 7 || j == 0) {
                            break;
                        }
                    }
                }

            }
        
            if (res == 2 || res == 3) {
                if (lastX !== 0 && lastY != 0) {

                    for (var i = lastY - 1, j = lastX - 1; ; i-- , j--) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 0 || j == 0) {
                            break;
                        }
                    }

                }

                if (lastX !== 7 && lastY != 7) {

                    for (var i = lastY + 1, j = lastX + 1; ; i++ , j++) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 7 || j == 7) {
                            break;
                        }
                    }

                }
            }
        }
        

        for (var i = 1; i < word.length; i++) {
            letter = word[i];

            if (res == 0 || res == 1) {
                res = getRandomInt(2) + 2;
            }
            else if (res == 2 || res == 3) {
                res = getRandomInt(2);
            }

            Bishop_ShiftFigure(res, letter)

        }
    }

    //Проверка стартовой позиции фигуры
    function Bishop_CheckStartPosition(X, Y) {

        if ((X == 0 && Y == 0) || (X == 1 && Y == 0) || (X == 0 && Y == 1)) {
            return 0;
        }
        else if ((X == 7 && Y == 7) || (X == 7 && Y == 6) || (X == 6 && Y == 7)) {
            return 1;
        }
        else if ((X == 7 && Y == 0) || (X == 6 && Y == 0) || (X == 7 && Y == 1)) {
            return 2;
        }
        else if ((X == 0 && Y == 7) || (X == 0 && Y == 6) || (X == 1 && Y == 7)) {
            return 3
        }

        return -1;

    }

    //Подготовка поля
    function Bishop_PrepareField() {
        ChessMatrix[0][0] = -2;
        ChessMatrix[7][0] = -2;
        ChessMatrix[7][7] = -2;
        ChessMatrix[0][7] = -2;

        ChessMatrix[0][1] = -2;
        ChessMatrix[1][0] = -2;
        ChessMatrix[6][0] = -2;
        ChessMatrix[7][1] = -2;

        ChessMatrix[0][6] = -2;
        ChessMatrix[1][7] = -2;
        ChessMatrix[6][7] = -2;
        ChessMatrix[7][6] = -2;
    }

    function Bishop_ShiftFigure(direction, letter) {

        let shift;

        switch (Bishop_Direction[direction]) {
            case 'RIGHT-UP': {

                shift = Bishop_CheckDiagonalBishop('RIGHT-UP')

                if (shift === -1) {

                    shift = Bishop_CheckDiagonalBishop('LEFT-DOWN')
                }

                if (shift === -1) {
                    console.log('Не удалось')
                    return false;
                }


                figureY = shift[0]
                figureX = shift[1]

                ChessMatrix[figureY][figureX] = -5;

                Bishop_FillDiagonal('RIGHT-UP')

                break;
            }

            case 'LEFT-DOWN': {

                shift = Bishop_CheckDiagonalBishop('LEFT-DOWN')

                if (shift === -1) {

                    shift = Bishop_CheckDiagonalBishop('RIGHT-UP')
                }

                if (shift === -1) {
                    console.log('Не удалось')
                    return false;
                }


                figureY = shift[0]
                figureX = shift[1]

                ChessMatrix[figureY][figureX] = -5;

                Bishop_FillDiagonal('LEFT-DOWN')

                break;
            }

            case 'LEFT-UP': {

                shift = Bishop_CheckDiagonalBishop('LEFT-UP')

                if (shift === -1) {

                    shift = Bishop_CheckDiagonalBishop('RIGHT-DOWN')
                }

                if (shift === -1) {
                    console.log('Не удалось')
                    return false;
                }


                figureY = shift[0]
                figureX = shift[1]

                ChessMatrix[figureY][figureX] = -5;
                
                Bishop_FillDiagonal('LEFT-UP')

                break;
            }

            case 'RIGHT-DOWN': {

                shift = Bishop_CheckDiagonalBishop('RIGHT-DOWN')

                if (shift === -1) {

                    shift = Bishop_CheckDiagonalBishop('LEFT-UP')
                }

                if (shift === -1) {
                    console.log('Не удалось')
                    return false;
                }


                figureY = shift[0]
                figureX = shift[1]

                ChessMatrix[figureY][figureX] = -5;

                Bishop_FillDiagonal('RIGHT-DOWN')

                break;
            }

        }
    }

    //Нахождение клетки для вставки буквы
    function Bishop_CheckDiagonalBishop(direction) {

        switch (direction) {
            case 'RIGHT-UP': {

                if (figureX == 7 || figureY == 0) {
                    return -1;
                }
                else {
                    return Bishop_FindIndexesForChess(figureX, figureY, 'RIGHT-UP')
                }

                break;
            }

            case 'LEFT-DOWN': {

                if (figureX == 0 || figureY == 7) {
                    return -1;
                }
                else {
                    return Bishop_FindIndexesForChess(figureX, figureY, 'LEFT-DOWN')
                }

                break;
            }

            case 'LEFT-UP': {

                if (figureX == 0 || figureY == 0) {
                    return -1;
                }
                else {
                    return Bishop_FindIndexesForChess(figureX, figureY, 'LEFT-UP')
                }

                break;
            }

            case 'RIGHT-DOWN': {

                if (figureX == 7 || figureY == 7) {
                    return -1;
                }
                else {
                    return Bishop_FindIndexesForChess(figureX, figureY, 'RIGHT-DOWN')
                }

                break;
            }

        }

        return -1;
    }

    //Нахождение клеток для вставки букв
    function Bishop_FindIndexesForChess(X, Y, direction) {

        let result = [];

        switch (direction) {
            case 'RIGHT-UP': {

                for (var i = Y - 1, j = X + 1; ; i-- , j++) {
                    if (ChessMatrix[i][j] == 0) {
                        result.push([i, j]);
                    }

                    if (i == 0 || j == 7) {
                        break;
                    }
                }

                if (result.length == 0) {
                    return -1;
                }

                return result[getRandomInt(result.length)];

                break;
            }

            case 'LEFT-DOWN': {

                for (var i = Y + 1, j = X - 1 ; ; i++ , j--) {

                    if (ChessMatrix[i][j] == 0) {
                        result.push([i, j]);
                    }

                    if (i == 7 || j == 0) {
                        break;
                    }
                }

                if (result.length == 0) {
                    return -1;
                }

                return result[getRandomInt(result.length)];

                break;
            }

            case 'LEFT-UP': {

                for (var i = Y - 1, j = X - 1; ; i-- , j--) {

                    if (ChessMatrix[i][j] == 0) {
                        result.push([i, j]);
                    }

                    if (i == 0 || j == 0) {
                        break;
                    }
                }

                if (result.length == 0) {
                    return -1;
                }

                return result[getRandomInt(result.length)];

                break;
            }

            case 'RIGHT-DOWN': {

                for (var i = Y + 1, j = X + 1; ; i++ , j++) {

                    if (ChessMatrix[i][j] == 0) {
                        result.push([i, j]);
                    }

                    if (i == 7 || j == 7) {
                        break;
                    }
                }

                if (result.length == 0) {
                    return -1;
                }

                return result[getRandomInt(result.length)];

                break;
            }

        }

        return -1;
    }

    //Заливка клеток с неподходящими значениями
    function Bishop_FillDiagonal(direction) {

        switch (direction) {
            case 'RIGHT-UP':
            case 'LEFT-DOWN': {

                if (figureX !== 7 && figureY !== 0) {

                    for (var i = figureY - 1, j = figureX + 1; ; i-- , j++) {
                        if (ChessMatrix[i][j] == 0 ) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 0 || j == 7) {
                            break;
                        }
                    }

                }

                if (figureX !== 0 && figureY !== 7) {

                    for (var i = figureY + 1, j = figureX - 1; ; i++ , j--) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 7 || j == 0) {
                            break;
                        }
                    }
                }
                
                break;
            }

            case 'LEFT-UP': 
            case 'RIGHT-DOWN': {

                if (figureX !== 0 && figureY != 0) {

                    for (var i = figureY - 1, j = figureX - 1; ; i-- , j--) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 0 || j == 0) {
                            break;
                        }
                    }

                }

                if (figureX !== 7 && figureY != 7) {

                    for (var i = figureY + 1, j = figureX + 1; ; i++ , j++) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 7 || j == 7) {
                            break;
                        }
                    }

                }

                break;
            }

        }

    }

    /*BISHOP END-----------------------------------------------------------------------------------------*/



    /*ROOK START-----------------------------------------------------------------------------------------*/

    //Ладья
    function Rook(word) {

        let lastX = figureX;
        let lastY = figureY;

        ChessMatrix[figureY][figureX] = -5;

        let letter;
        let choice = 4;

        let tempRand = getRandomInt(choice);

        Rook_ShiftFigure(tempRand, word[0]);

        if (tempRand == 0 || tempRand == 1) {

            for (var i = 0; i < 8; i++) {
                if (ChessMatrix[i][lastX] != -5) {
                    ChessMatrix[i][lastX] = -2;
                }

            }
        }

        if (tempRand == 2 || tempRand == 3) {

            for (var i = 0; i < 8; i++) {
                if (ChessMatrix[lastY][i] != -5) {
                    ChessMatrix[lastY][i] = -2;
                }

            }
        }

        for (var i = 1; i < word.length; i++) {
            letter = word[i];

            if (tempRand == 0 || tempRand == 1) {
                tempRand = getRandomInt(2) + 2;
            }
            else if (tempRand == 2 || tempRand == 3) {
                tempRand = getRandomInt(2);
            }

            Rook_ShiftFigure(tempRand, letter)

        }
    }

    //Перемещение фигуры
    function Rook_ShiftFigure(direction, letter) {

        let shift;

        switch (Rook_Direction[direction]) {
            case 'RIGHT': {

                shift = Rook_CheckRowOrColumRook('RIGHT')

                if (shift == -1) {

                    shift = Rook_CheckRowOrColumRook('LEFT')
                }

                if (shift == -1) {
                    console.log('Не удалось')
                    return false;
                }

                ChessMatrix[figureY][shift] = -5;

                Rook_FillRowOrColum('X')

                figureX = shift

                break;
            }

            case 'LEFT': {

                shift = Rook_CheckRowOrColumRook('LEFT')

                if (shift == -1) {

                    shift = Rook_CheckRowOrColumRook('RIGHT')
                }

                if (shift == -1) {
                    console.log('Не удалось')
                    return false;
                }

                ChessMatrix[figureY][shift] = -5;
               
                Rook_FillRowOrColum('X')

                figureX = shift

                break;
            }

            case 'UP': {

                shift = Rook_CheckRowOrColumRook('UP')

                if (shift == -1) {

                    shift = Rook_CheckRowOrColumRook('DOWN')
                }

                if (shift == -1) {
                    console.log('Не удалось')
                    return false;
                }

                ChessMatrix[shift][figureX] = -5;
                
                Rook_FillRowOrColum('Y')

                figureY = shift

                break;
            }

            case 'DOWN': {

                shift = Rook_CheckRowOrColumRook('DOWN')

                if (shift == -1) {

                    shift = Rook_CheckRowOrColumRook('UP')
                }

                if (shift == -1) {
                    console.log('Не удалось')
                    return false;
                }

                ChessMatrix[shift][figureX] = -5;

                Rook_FillRowOrColum('Y')

                figureY = shift

                break;
            }
           
        }
    }

    //Нахождение клетки для вставки буквы
    function Rook_CheckRowOrColumRook(direction) {

        switch (direction) {
            case 'RIGHT': {

                if (figureX == 7) {
                    return -1;
                }
                else {            
                    return Rook_FindIndexesForChess('X', figureX, 'RIGHT')
                }

                break;
            }

            case 'LEFT': {

                if (figureX == 0) {
                    return -1;
                }
                else {
                    return Rook_FindIndexesForChess('X', figureX, 'LEFT')
                }
              
                break;
            }

            case 'UP': {

                if (figureY == 0) {
                    return -1;
                }
                else {
                    return Rook_FindIndexesForChess('Y', figureY, 'UP')
                }

                break;
            }

            case 'DOWN': {

                if (figureY == 7) {
                    return -1;
                }
                else {
                    return Rook_FindIndexesForChess('Y', figureY, 'DOWN')
                }

                break;
            }

        }

        return -1;
    }

    //Нахождение клеток для вставки букв
    function Rook_FindIndexesForChess(axis, startIndex, direction) {

        let result = [];

        switch (axis) {

            case 'X': {

                switch (direction) {

                    case 'RIGHT': {

                        for (var i = startIndex + 1; i < 8; i++) {
                            if (ChessMatrix[figureY][i] != -2 && ChessMatrix[figureY][i] != -5) {
                                result.push(i);
                            }
                        }

                        if (result.length == 0) {
                            return -1;
                        }

                        return result[getRandomInt(result.length)];

                        break;
                    } 

                    case 'LEFT': {

                        for (var i = startIndex - 1; i >= 0; i--) {
                            if (ChessMatrix[figureY][i] != -2 && ChessMatrix[figureY][i] != -5) {
                                result.push(i);
                            }
                        }

                        if (result.length == 0) {
                            return -1;
                        }

                        return result[getRandomInt(result.length)];

                        break;
                    } 
                }

                break;
            }

            case 'Y': {

                switch (direction) {

                    case 'UP': {

                        for (var i = startIndex - 1; i >= 0; i--) {
                            if (ChessMatrix[i][figureX] != -2 && ChessMatrix[i][figureX] != -5) {
                                result.push(i);
                            }
                        }

                        if (result.length == 0) {
                            return -1;
                        }

                        return result[getRandomInt(result.length)];

                        break;
                    }

                    case 'DOWN': {

                        for (var i = startIndex + 1; i < 8; i++) {
                            if (ChessMatrix[i][figureX] != -2 && ChessMatrix[i][figureX] != -5) {
                                result.push(i);
                            }
                        }

                        if (result.length == 0) {
                            return -1;
                        }

                        return result[getRandomInt(result.length)];

                        break;
                    }
                }

                break;
            }

        }

        return -1;
    }

    //Заливка клеток с неподходящими значениями
    function Rook_FillRowOrColum(axis) {

        if (axis == 'X') {
            for (var i = 0; i < 8; i++) {
                if (ChessMatrix[figureY][i] != -5) {
                    ChessMatrix[figureY][i] = -2;
                }
                
            }
            return;
        }

        if (axis == 'Y') {
            for (var i = 0; i < 8; i++) {
                if (ChessMatrix[i][figureX] != -5) {
                    ChessMatrix[i][figureX] = -2;
                }
                
            }
            return;
        }

    }

    /*ROOK END-------------------------------------------------------------------------------------------*/

    /*CHESS END------------------------------------------------------------------------------------------*/




    //Получение рандомного числа
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    //Перемешивание массива
    function Shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }


    //События

    //Выбор слова для судоку
    $('#sudoku-values').on('click', 'li', function () {
        SetSudoku($(this).text())
    });

    //Выбор слова для кросворда
    $('#crossword-values').on('click', 'li', function () {
        CreateCrossword($(this).text())
    });

    //Выбор слова для шахмат
    /*$('#chess-values').on('click', 'li', function () {
        CreateChess($(this).text())
    });*/
});