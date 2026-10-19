const WHATSAPP_NUMBER = "923417688257";

// Demo products: apni real products aur prices yahan edit karein.
const products = [
  {id:1,name:"Classic Silver",price:4500,oldPrice:5500,tag:"BESTSELLER",category:"Classic",image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80"},
  {id:2,name:"Golden Heritage",price:6200,oldPrice:7500,tag:"POPULAR",category:"Luxury",image:"https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80"},
  {id:3,name:"Midnight Black",price:5200,oldPrice:0,tag:"NEW",category:"Modern",image:"https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=80"},
  {id:4,name:"Urban Chronograph",price:7800,oldPrice:9000,tag:"SPECIAL",category:"Sport",image:"https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=700&q=80"},
  {id:5,name:"Minimal White",price:3900,oldPrice:0,tag:"CLASSIC",category:"Classic",image:"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80"},
  {id:6,name:"Royal Gold",price:8500,oldPrice:9900,tag:"PREMIUM",category:"Luxury",image:"https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=700&q=80"},
  {id:7,name:"Sport Edition",price:5800,oldPrice:0,tag:"SPORT",category:"Sport",image:"https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&w=700&q=80"},
  {id:8,name:"Executive Brown",price:6900,oldPrice:7900,tag:"TRENDING",category:"Modern",image:"https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=700&q=80"}
];

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("aurumCart") || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter(item =>
      products.some(p => p.id === item.id) &&
      Number.isInteger(item.qty) && item.qty > 0
    );
  } catch (e) { return []; }
}

let cart = loadCart();

function money(amount) {
  return "Rs. " + Number(amount).toLocaleString("en-PK");
}

function productCard(p) {
  return `
    <article class="product">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="stars">★★★★★ <span style="color:#888">(${p.category})</span></div>
        <div class="price">${money(p.price)} ${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ""}</div>
        <button class="add" onclick="addToCart(${p.id})">ADD TO CART +</button>
      </div>
    </article>`;
}

function renderFeatured() {
  document.getElementById("featured").innerHTML = products.slice(0,4).map(productCard).join("");
}

function renderShop() {
  const term = document.getElementById("search").value.trim().toLowerCase();
  const sort = document.getElementById("sort").value;
  let list = products.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));

  if (sort === "low") list.sort((a,b) => a.price-b.price);
  if (sort === "high") list.sort((a,b) => b.price-a.price);
  if (sort === "name") list.sort((a,b) => a.name.localeCompare(b.name));

  document.getElementById("shopProducts").innerHTML = list.map(productCard).join("");
  document.getElementById("noResults").style.display = list.length ? "none" : "block";
}

function saveCart() {
  try { localStorage.setItem("aurumCart", JSON.stringify(cart)); } catch(e) {}
  updateCount();
}

function updateCount() {
  document.getElementById("count").textContent = cart.reduce((sum,item) => sum+item.qty,0);
}

function addToCart(id) {
  const item = cart.find(p => p.id === id);
  if (item) item.qty++;
  else cart.push({id:id,qty:1});
  saveCart();
  showNotice("Watch added to your cart!");
}

function changeQty(id,delta) {
  const item = cart.find(p => p.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(p => p.id !== id);
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(p => p.id !== id);
  saveCart();
  renderCart();
  showNotice("Item removed from cart.");
}

function renderCart() {
  const box = document.getElementById("cartContent");

  if (!cart.length) {
    box.innerHTML = `<div class="empty"><h2>Your cart is empty 🛒</h2><p>Add your favourite watch to get started.</p><button class="btn" onclick="showPage('shop')">BROWSE WATCHES</button></div>`;
    return;
  }

  let total = 0;
  const rows = cart.map(item => {
    const p = products.find(product => product.id === item.id);
    if (!p) return "";
    const subtotal = p.price * item.qty;
    total += subtotal;

    return `<div class="cart-row">
      <div><h3>${p.name}</h3><p>${money(p.price)} each</p><p>Subtotal: ${money(subtotal)}</p></div>
      <div class="qty">
        <button onclick="changeQty(${p.id},-1)" aria-label="Decrease quantity">−</button>
        <strong>${item.qty}</strong>
        <button onclick="changeQty(${p.id},1)" aria-label="Increase quantity">+</button>
      </div>
      <button class="remove" onclick="removeItem(${p.id})">Remove</button>
    </div>`;
  }).join("");

  box.innerHTML = `<h2>Cart Items (${cart.reduce((sum,item)=>sum+item.qty,0)})</h2>
    ${rows}
    <div class="cart-total">
      <p>Subtotal</p><h2>${money(total)}</h2>
      <p style="color:#777;margin-bottom:18px">Delivery charges can be confirmed on WhatsApp.</p>
      <button class="btn" onclick="checkout()">ORDER ON WHATSAPP →</button>
      <button class="btn" style="background:white;margin-top:8px" onclick="showPage('shop')">CONTINUE SHOPPING</button>
    </div>`;
}

function checkout() {
  if (!cart.length) {
    showNotice("Your cart is empty.");
    return;
  }

  const orderLines = cart.map(item => {
    const p = products.find(product => product.id === item.id);
    return `${p.name} x ${item.qty} = ${money(p.price*item.qty)}`;
  });

  const total = cart.reduce((sum,item) => {
    const p = products.find(product => product.id === item.id);
    return sum + p.price*item.qty;
  },0);

  const message = [
    "Assalam-o-Alaikum! I want to place an order from AURUM Watches.",
    "", "My Order:", ...orderLines, "",
    "Total: " + money(total), "",
    "Please confirm availability and delivery charges.",
    "Customer Name:", "Delivery Address:", "Contact Number:"
  ].join("\n");

  window.open("https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(message),"_blank","noopener");
}

function showPage(id,updateHistory=true) {
  const pages = ["home","shop","about","contact","cart"];
  if (!pages.includes(id)) id = "home";

  document.querySelectorAll(".page").forEach(page => page.classList.toggle("active",page.id===id));
  document.querySelectorAll("[data-page]").forEach(link => link.classList.toggle("active",link.dataset.page===id));
  document.getElementById("nav").classList.remove("open");

  if (updateHistory) history.pushState({page:id},"","#"+id);
  if (id==="shop") renderShop();
  if (id==="cart") renderCart();

  window.scrollTo({top:0,behavior:"smooth"});
}

function toggleMenu() {
  document.getElementById("nav").classList.toggle("open");
}

let noticeTimer;
function showNotice(message) {
  const el = document.getElementById("notice");
  el.textContent = message;
  el.style.display = "block";
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => el.style.display="none",2500);
}

document.getElementById("contactForm").addEventListener("submit",function(event) {
  event.preventDefault();
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const messageText = document.getElementById("customerMessage").value.trim();

  const message = [
    "Assalam-o-Alaikum! I have an enquiry for AURUM Watches.",
    "", "Name: "+name,
    "Phone: "+(phone || "Not provided"),
    "Email: "+(email || "Not provided"),
    "Message: "+messageText
  ].join("\n");

  window.open("https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(message),"_blank","noopener");
});

window.addEventListener("popstate",() => {
  showPage(location.hash.slice(1)||"home",false);
});

document.getElementById("year").textContent = new Date().getFullYear();
renderFeatured();
renderShop();
updateCount();

const firstPage = location.hash.slice(1);
if (["home","shop","about","contact","cart"].includes(firstPage)) {
  showPage(firstPage,false);
}