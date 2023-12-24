let bookList = [],
  basketList = [];

  const toggleButton = document.getElementById('toggleButton');
  const body = document.body;
  
  toggleButton.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      body.classList.toggle('dark-mode');
  });


// toggle menu olusturma


function toggleModal() {
  const basketModal = document.querySelector(".basket_modal");
  console.log(basketModal);
  basketModal.classList.toggle("active");
}

function getBooks() {
  fetch("./products.json")
    .then((res) => res.json())
    .then((books) => (bookList = books))
    .catch((err) => console.log(err));
}

getBooks();

//

const createBookStars = (starRate) => {
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i) {
      starRateHtml += ` <i class="bi bi-star-fill active"></i>`;
    } else {
      starRateHtml += ` <i class="bi bi-star-fill"></i>`;
    }
  }
  return starRateHtml;
};

//${index % 2 == 0 && "offset-2"} aynı zamanda ${index % 2 == 0 ? "offset-2" : ""} olarakda yazılır
const createBookItemsHtml = () => {
  const bookListEl = document.querySelector(".book_list");
  let bookListHtml = "";
  bookList.forEach((book, index) => {
    bookListHtml += `
    <div class="col-5 ${index % 2 == 0 && "offset-2"} my-5">
    
          <div class="row book_card">
            <div class="col-6">
              <img
                src="${book.imgSource}"
                alt=""
                class="img-fluid shadow"
                width="258px"
                height="400px"
              />
            </div>
            <div class="col-6 d-flex flex-column justify-content-center gap-4">
              <div class="book_detail">
                <span class="fos gray fs-5">${book.author}</span><br />
                <span class="fs-4 fw-bold">${book.name}</span><br />
                <span class="book_star_rate">
                ${createBookStars(book.starRate)}
                 
                  <span class="gray">1938 reviews</span>
                </span>
                <p class="book_desc fos gray">
                  ${book.description}
                </p>
                <div>
                  <span class="black fw-bold fs-5 me-2">${book.price} TL</span>
                  <span class="fs-5 fw-bold old_price">${
                    book.oldPrice
                      ? `<span class="fs-5 fw-bold old_price">${book.oldPrice} TL</span>
                  `
                      : ""
                  }</span>
                </div>
                <button class="btn_purple" onClick="addBookToBasket(${
                  book.id
                })">Sepete Ekle</button>
              </div>
            </div>
          </div>
        </div>
    `;
  });
  bookListEl.innerHTML = bookListHtml;
};

const BOOK_TYPES = {
  ALL: "Tümü",
  NOVEL: "Roman",
  CHILDREN: "Çocuk",
  HISTORY: "Tarih",
  FINANCE: "Finans",
  SCIENCE: "Bilim",
  SELFIMPROVEMENT: "Kişisel Gelişim",
};

const createBookTypesHtml = () => {
  const filterEle = document.querySelector(".filter");
  let filterHtml = "";
  // filtre türlerini tutacak dizi all türüyle başlatılmıştr
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    // !eğer filtre türleri dizisinde bu tür bulunmuyorsa ekleme işlemi yapar
    if (filterTypes.findIndex((filter) => filter == book.type) == -1) {
      filterTypes.push(book.type);
    }
  });
  filterTypes.forEach((type, index) => {
    filterHtml += ` <li onClick="filterBooks(this)" data-types="${type}" class="${
      index == 0 ? "active" : null
    }">${BOOK_TYPES[type] || type}</li>`;
  });

  filterEle.innerHTML = filterHtml;
};

const filterBooks = (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let bookType = filterEl.dataset.types;
  console.log(bookType);

  getBooks();
  if (bookType != "ALL") {
    bookList = bookList.filter((book) => book.type == bookType);
  }
  createBookItemsHtml();
};

const listBasketItems = () => {
  const basketListEl = document.querySelector(".basket_list");
  const basketCountEl = document.querySelector(".basket_count");
  console.log(basketList);
  const totalQuantity = basketList.reduce(
    (total, item) => total + item.quantity,
    0
  );
  basketCountEl.innerHTML = totalQuantity > 0 ? totalQuantity : null;
  const totalPriceEl = document.querySelector(".total_price");
  console.log(totalPriceEl);
  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach((item) => {
    console.log(item);
    totalPrice += item.product.price * item.quantity;
    basketListHtml += `
    <li class="basket_item">
    <img
      src="${item.product.imgSource}"
      alt=""
      width="100"
      height="100"
    />
    <div class="basket_item-info">
      <h3 class="book_name">${item.product.name}</h3>
      <span class="book_price">${item.product.price}tl</span> <br />
      <span class="book_remove" onClick="removeItemBasket(${item.product.id})">Sepetten Kaldır</span>
    </div>
    <div class="book_count">
      <span class="decrease" onClick="decreaseItemToBasket(${item.product.id})">-</span>
      <span class="mx-2">${item.quantity}</span>
      <span class="increase" onClick="increaseItemToBasket(${item.product.id})">+</span>
    </div>
  </li>
    
    `;
  });
  basketListEl.innerHTML = basketListHtml
    ? basketListHtml
    : `<li class="basket_item">Sepette herhangi bir ürün bulunmuyor.Sepete ürün ekleyiniz.</li>`;
  totalPriceEl.innerHTML = totalPrice > 0 ? "Total:" + totalPrice + "tl" : null;
};
// !sepete ürün ekleme
const addBookToBasket = (bookId) => {
  let findedBook = bookList.find((book) => book.id == bookId);
  // console.log(findedBook);
  if (findedBook) {
    // !sepetteki ürünün zaten var olup olmadığını kontrol et
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id == bookId
    );
    // ! eğer sepet boşsa ya daa eklenen kitap sepette yoksa
    if (basketAlreadyIndex == -1) {
      let addItem = { quantity: 1, product: findedBook };
      basketList.push(addItem);
    } else {
      // sepette zaten var olan bir kitap ekleniyorsa miktarını artıtır
      basketList[basketAlreadyIndex].quantity += 1;
    }
  }
  const btnCheck = document.querySelector(".btnCheck");

  btnCheck.style.display = "block";
  // ! s epet içeriğini güncelleme ve görünteleme
  listBasketItems();
};
//! sepetten ürünü kaldırır
const removeItemBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  // !eğer kitap sepet içinde bulunuyorsa
  if (findedIndex != -1) {
    // splice belirli sayıda eleman silmek için kullanıluyor
    // sepet listesinden kitabı çıkar
    basketList.splice(findedIndex, 1);
  }
  const btnCheck = document.querySelector(".btnCheck");
  btnCheck.style.display = "none";
  // sepet içeriğini günceller
  listBasketItems();
};

// sepetteki ürünün miktarını azaltır
const decreaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  // eğer kitap sepet içinde bulunuyorsa
  if (findedIndex != -1) {
    // eğer kitabın miktarı 1den büyükse
    if (basketList[findedIndex].quantity != 1) {
      basketList[findedIndex].quantity -= 1;
    } else {
      removeItemBasket(bookId);
    }
    listBasketItems();
  }

  // sepet içeriğini güncelleme
  listBasketItems();
};
// sepetteki miktarı arttırırma
const increaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  // eğer kitap sepet içinde bulunuyorsa
  if (findedIndex != -1) {
    // kitabın miktarını bir arttır
    basketList[findedIndex].quantity += 1;
  }
  // sepet içeriğini güncelle
  listBasketItems();
};

// !! datanın gelmesini bekle
setTimeout(() => {
  createBookItemsHtml();
  createBookTypesHtml();
}, 100);
