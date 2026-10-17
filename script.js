const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
let bag = [], wishlist = new Set(), activeFilter = 'All', toastTimer;
const toast = $('#toast');
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)}
function openModal(el){el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeModal(el){el.classList.remove('open');el.setAttribute('aria-hidden','true');if(!$('.modal-backdrop.open'))document.body.style.overflow=''}
$('#year').textContent=new Date().getFullYear();
$('#menuToggle').addEventListener('click',()=>{const open=$('#mainNav').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));$('#menuToggle').textContent=open?'×':'☰'});
$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{$('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').textContent='☰'}));
function applyProducts(){const term=$('#searchInput').value.trim().toLowerCase();let visible=0;$$('.product-card').forEach(card=>{const matchTerm=card.dataset.name.toLowerCase().includes(term)||card.dataset.category.toLowerCase().includes(term);const matchFilter=activeFilter==='All'||card.dataset.category.toLowerCase().includes(activeFilter.toLowerCase());const show=matchTerm&&matchFilter;card.hidden=!show;if(show)visible++});$('#noResults').hidden=visible!==0;$('#resultCount').textContent=`${visible} style${visible===1?'':'s'} to explore`;$$('.filter-button').forEach(b=>b.classList.toggle('active',b.dataset.filter===activeFilter))}
$('#searchInput').addEventListener('input',applyProducts);
$$('.filter-button').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;applyProducts()}));
$$('.category-card').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;applyProducts();$('#shop').scrollIntoView({behavior:'smooth'});notify(`Showing ${b.dataset.filter.toLowerCase()} styles`)}));
$$('[data-filter-link]').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filterLink;$('#searchInput').value='';applyProducts()}));
function updateCounts(){$('#bagCount').textContent=bag.length;$('#wishCount').textContent=wishlist.size;$('#wishlistTop').setAttribute('aria-label',`Wishlist, ${wishlist.size} items`)}
$$('.add-button').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.product-card');bag.push({name:b.dataset.add,price:Number(card.dataset.price),image:card.querySelector('.product-image img')?.getAttribute('src')||'',alt:card.querySelector('.product-image img')?.alt||b.dataset.add});updateCounts();renderBag();notify(`${b.dataset.add} added to your bag`)}));
$$('.heart-button').forEach(b=>b.addEventListener('click',()=>{const name=b.closest('.product-card').dataset.name;if(wishlist.has(name)){wishlist.delete(name);b.classList.remove('selected');b.textContent='♡';notify('Removed from wishlist')}else{wishlist.add(name);b.classList.add('selected');b.textContent='♥';notify('Saved to your wishlist')}updateCounts()}));
function renderBag(){const container=$('#bagItems');if(!bag.length){container.innerHTML='<p>Your bag is waiting for something lovely.</p>'}else{container.innerHTML=bag.map((item,i)=>`<div class="bag-item"><img src="${escapeHTML(item.image||'')}" alt="${escapeHTML(item.alt||item.name)}"><div class="bag-item-details"><span>${escapeHTML(item.name)}</span><strong>₦${Number(item.price).toLocaleString('en-NG')}</strong></div><button type="button" data-remove="${i}">Remove</button></div>`).join('');$$('[data-remove]',container).forEach(b=>b.addEventListener('click',()=>{bag.splice(Number(b.dataset.remove),1);updateCounts();renderBag()}))}$('#bagTotal').textContent='₦'+bag.reduce((sum,item)=>sum+item.price,0).toLocaleString('en-NG')}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#bagTop').addEventListener('click',()=>{renderBag();openModal($('#bagModal'))});$('#closeBag').addEventListener('click',()=>closeModal($('#bagModal')));$('#checkoutDemo').addEventListener('click',()=>notify('This is a website demo — checkout is not connected.'));
$('#wishlistTop').addEventListener('click',()=>{if(!wishlist.size){notify('Your wishlist is empty for now');return}activeFilter='All';$('#searchInput').value='';applyProducts();$$('.product-card').forEach(c=>c.hidden=!wishlist.has(c.dataset.name));$('#resultCount').textContent=`${wishlist.size} saved style${wishlist.size===1?'':'s'}`;$('#shop').scrollIntoView({behavior:'smooth'});notify('Here are your saved styles')});

// Product details: tap/click a product card (except its action buttons) to choose size/colour.
const productModal=$('#productModal'); let selectedProduct=null;
function openProductDetails(card){selectedProduct=card;const img=$('.product-image img',card);$('#detailImage').src=img.getAttribute('src');$('#detailImage').alt=img.alt||card.dataset.name;$('#detailName').textContent=card.dataset.name;$('#detailPrice').textContent='₦'+Number(card.dataset.price).toLocaleString('en-NG');$('#detailDescription').textContent=$('.product-info p',card)?.textContent||'A considered modest fashion piece from ZÉENAT.';$('#detailSize').value='';$('#detailColour').value='As pictured';openModal(productModal);}
$$('.product-card').forEach(card=>{card.setAttribute('tabindex','0');card.setAttribute('role','button');card.setAttribute('aria-label',`View details for ${card.dataset.name}`);card.addEventListener('click',e=>{if(e.target.closest('button'))return;openProductDetails(card)});card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();openProductDetails(card)}})});
$('#closeProduct').addEventListener('click',()=>closeModal(productModal));
$('#detailAdd').addEventListener('click',()=>{if(!selectedProduct)return;const size=$('#detailSize').value;if(!size){notify('Please choose a size first');$('#detailSize').focus();return;}const image=$('.product-image img',selectedProduct);bag.push({name:selectedProduct.dataset.name+' · '+size+' · '+$('#detailColour').value,price:Number(selectedProduct.dataset.price),image:image.getAttribute('src'),alt:image.alt||selectedProduct.dataset.name});updateCounts();renderBag();closeModal(productModal);notify('Selected item added to your bag');});

$('#openFit').addEventListener('click',()=>openModal($('#fitModal')));$('#closeFit').addEventListener('click',()=>closeModal($('#fitModal')));$('#fitForm').addEventListener('submit',e=>{e.preventDefault();const size=$('#fitSize').value,style=$('#fitStyle').value,occasion=$('#fitOccasion').value;$('#fitResult').hidden=false;$('#fitResult').textContent=`Your starting point: look for ${style.toLowerCase()} pieces in ${size}. For ${occasion.toLowerCase()}, choose a style that feels comfortable when sitting, walking and moving. Please check each garment's real size chart before ordering.`;notify('Your fit starting point is ready')});
$('#newsletterForm').addEventListener('submit',e=>{e.preventDefault();notify('Thanks for your interest in ZÉENAT! This demo does not save email addresses.');$('#emailInput').value=''});
// Tap any fashion photo to open a large, responsive viewer.
const lightbox=$('#imageLightbox'), lightboxImg=$('#lightboxImage'), caption=$('#lightboxCaption');
let imageItems=[], imageIndex=0;
function collectImages(){imageItems=$$('.zoomable').filter(img=>img.getAttribute('src') && img.id!=='lightboxImage');}
function showImage(index){
  collectImages();
  if(!imageItems.length)return;
  imageIndex=(index+imageItems.length)%imageItems.length;
  const img=imageItems[imageIndex];
  lightboxImg.src=img.currentSrc||img.src;
  lightboxImg.alt=img.alt||'ZÉENAT fashion image';
  caption.textContent=img.alt||'ZÉENAT collection';
  openModal(lightbox);
}
$$('.zoomable').forEach(img=>{
  img.tabIndex=0;
  img.setAttribute('role','button');
  img.setAttribute('aria-label',`Open larger image: ${img.alt||'fashion image'}`);
  img.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();collectImages();showImage(imageItems.indexOf(img));});
  img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();collectImages();showImage(imageItems.indexOf(img));}});
});
$('#lightboxClose').addEventListener('click',()=>closeModal(lightbox));
$('#lightboxPrev').addEventListener('click',()=>showImage(imageIndex-1));
$('#lightboxNext').addEventListener('click',()=>showImage(imageIndex+1));
$$('.modal-backdrop').forEach(modal=>modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal);}));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')$$('.modal-backdrop.open').forEach(closeModal);
  if(lightbox.classList.contains('open')&&e.key==='ArrowRight')showImage(imageIndex+1);
  if(lightbox.classList.contains('open')&&e.key==='ArrowLeft')showImage(imageIndex-1);
});
applyProducts();updateCounts();
