// ===================================
// データ
// ===================================
const KEY = 'cards';     // localStorage に保存するときのキー名
let cards = [];          // カードを全部入れておく配列
let currentCard = null;  // 今出題しているカード
let editingIndex = null; // 編集中のカードの番号（編集していないときは null）

// ===================================
// 保存する
// ===================================
function save() {
  localStorage.setItem(KEY, JSON.stringify(cards));
}

// ===================================
// 一覧に1枚表示する（index = cards の中の何番目か）
// ===================================
function addCardToList(card, index) {
  const $li = $('<li class="card"></li>');
  $('<span class="card-tag"></span>').text(card.tag).appendTo($li);
  $('<p class="card-question"></p>').text(card.question).appendTo($li);

  // 答えは <details> の中に入れて、押したときだけ開く
  const $details = $('<details></details>');
  $('<summary>答えを見る</summary>').appendTo($details);
  $('<pre></pre>').text(card.answer).appendTo($details);
  $details.appendTo($li);

  // 編集・削除ボタン（何番目のカードかを data-index に書いておく）
  const $actions = $('<div class="card-actions"></div>');
  $('<button class="card-btn edit-btn">編集</button>').attr('data-index', index).appendTo($actions);
  $('<button class="card-btn delete-btn">削除</button>').attr('data-index', index).appendTo($actions);
  $actions.appendTo($li);

  $('#cardList').append($li);
}

// ===================================
// 選んでいるジャンルのカードだけを集める（出題用）
// ===================================
function getFilteredCards() {
  const tag = $('#filter').val();
  const result = [];
  for (let i = 0; i < cards.length; i++) {
    if (tag === 'すべて' || cards[i].tag === tag) {
      result.push(cards[i]);
    }
  }
  return result;
}

// ===================================
// 一覧を作り直す
// ===================================
function render() {
  $('#cardList').empty();
  const tag = $('#filter').val();
  let count = 0;
  for (let i = 0; i < cards.length; i++) {
    if (tag === 'すべて' || cards[i].tag === tag) {
      addCardToList(cards[i], i);
      count++;
    }
  }
  $('#count').text(count);
}

// ===================================
// 登録欄を「追加」の状態に戻す
// ===================================
function resetForm() {
  editingIndex = null;
  $('#questionInput').val('');
  $('#answerInput').val('');
  $('#addBtn').text('追加');
  $('#cancelBtn').hide();
}

// ===================================
// 出題欄を最初の状態に戻す
// ===================================
function resetQuiz() {
  currentCard = null;
  $('.quiz-tag').text('');
  $('.quiz-question').text('「出題する」を押してね');
  $('.quiz-answer').hide();
}

// ===================================
// 追加ボタン（編集中は「更新」ボタンになる）
// ===================================
$('#addBtn').on('click', function () {
  const tag = $('#tagInput').val();
  const question = $('#questionInput').val().trim();
  const answer = $('#answerInput').val().trim();

  // 問題か答えが空なら何もしない
  if (question === '' || answer === '') {
    return;
  }

  const card = { tag: tag, question: question, answer: answer };

  if (editingIndex === null) {
    cards.push(card);            // 追加：一番後ろに足す
  } else {
    cards[editingIndex] = card;  // 更新：その番号のカードを入れ替える
  }

  save();
  render();
  resetForm();
});

// ===================================
// キャンセルボタン（編集をやめる）
// ===================================
$('#cancelBtn').on('click', function () {
  resetForm();
});

// ===================================
// 編集ボタン
// ===================================
$('#cardList').on('click', '.edit-btn', function () {
  editingIndex = Number($(this).attr('data-index'));
  const card = cards[editingIndex];

  // 登録欄にそのカードの中身を入れる
  $('#tagInput').val(card.tag);
  $('#questionInput').val(card.question);
  $('#answerInput').val(card.answer);

  $('#addBtn').text('更新');
  $('#cancelBtn').show();
  $('#questionInput').focus();   // 登録欄までスクロールしてカーソルを置く
});

// ===================================
// 削除ボタン
// ===================================
$('#cardList').on('click', '.delete-btn', function () {
  const index = Number($(this).attr('data-index'));

  if (!confirm('このカードを削除しますか？')) {
    return;
  }

  // 出題中のカードを消すなら、出題欄も戻す
  if (currentCard === cards[index]) {
    resetQuiz();
  }

  cards.splice(index, 1);  // index 番目から1枚取り除く
  save();
  render();

  // 削除すると番号がずれるので、編集中なら取り消す
  if (editingIndex !== null) {
    resetForm();
  }
});

// ===================================
// ジャンルの絞り込み
// ===================================
$('#filter').on('change', function () {
  render();
});

// ===================================
// 出題する
// ===================================
$('#quizBtn').on('click', function () {
  const list = getFilteredCards();

  if (list.length === 0) {
    resetQuiz();
    $('.quiz-question').text('このジャンルのカードがありません');
    return;
  }

  const index = Math.floor(Math.random() * list.length);
  currentCard = list[index];

  $('.quiz-tag').text(currentCard.tag);
  $('.quiz-question').text(currentCard.question);
  $('.quiz-answer').text(currentCard.answer).hide();
});

// ===================================
// 答えを見る
// ===================================
$('#showBtn').on('click', function () {
  if (currentCard === null) {
    return;
  }
  $('.quiz-answer').fadeIn();
});

// ===================================
// 開いたときに読み込む
// ===================================
const saved = localStorage.getItem(KEY);
if (saved !== null) {
  cards = JSON.parse(saved);
}
render();