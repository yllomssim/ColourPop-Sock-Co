/* EVENT BUS */
/*The event bus is listening to events and communicating between different parts. 
In my code, it currently is set to listen for when a review is submitted, 
and updating the submitted reviews as it happens. */
const EventBus = new Vue();

Vue.component('product', {
	props: {
		premiumMembership: {
			type: Boolean,
			default: false
		},
		cart: Array
	},
	template: `
		<div class="products">
			<div id="app">
				<!-- SHOW CART BUTTON & PREMIUM MEMBERSHIP TICKBOX -->
				<div class="button shopping-cart-container">
					<input type="checkbox" v-model="premiumMembership"> Premium Member
					<span v-if="premiumMembership"> <!-- Show the pop-up message if premiumMembership is true -->
						<div class="premium-message">
						Yay! Free shipping!
						</div>
					</span>
					<br>
					<button @click="toggleCartOn" class="cart-count-button">
						<img src="images/cart.svg" height="40px" alt="Cart"><br>
						<span class="cart-count">
							{{ cartItemCount }} items
						</span>
					</button>
					<div class="shopping-cart-container-name">
						ColourPop Sock Co.
					</div>
				</div>

				<!-- MODAL SHOPPING CART -->
				<div class="modal" v-show="showCart">
					<div class="modalCard">
						<div class="close-button-container-cart">
							<button @click="toggleCartOff" class="cart-close-button"><img src="images/close.svg" height="20px" alt="Close cart"></button>
						</div>
						<h1 class="modal-cart-title">Shopping Cart</h1>
						<table class="cartTable">
							<thead>
								<tr>
									<th>Product</th>
									<th>Size</th>
									<th>Qty</th>
									<th>Cost</th>
									<th>Remove</th>
								</tr>
							</thead>

							<!-- UPDATE SIZE/QTY IN SHOPPING CART -->
							<tbody>
							<tr v-for="(item, index) in cart" :key="index">
							  <td>{{ item.name }}</td>
							  <td>
								<select v-model="item.size" @change="updateCartItem(index)" class="cart-size-update">
								  <option v-for="size in getProductSizes(item.id)" :key="size " >{{ size }}</option>
								</select>
							  </td>
							  <td>
							 	 <select v-model="item.quantity" @change="updateCartItem(index)" class="cart-quantity-update">
									<option v-for="quantity in getQuantityOptions()" :key="quantity">{{ quantity }}</option>
								</select>
							  </td>
							  <td>{{ cartItemCost(item) }}</td>
							  <td>
								<button @click="removeFromCart(index)">Remove</button>
							  </td>
							</tr>
						  </tbody>
						</table>

						<!-- SHOPPING CART SUMMARY -->
						<div class="cart-summary">
							<p>Total Quantity: {{ cartItemCount }}</p>
							<p>Shipping: {{ shipping }}</p>
							<p>Total Cost: {{ totalCartCostFormatted }}</p>
							<p><button class="tab-clear-cart" @click="clearCart">Clear Cart</button></p>
							<p><button class="tab-checkout" @click="checkout">Checkout</button></p>
						</div>

						<!-- CONFIRMATION MODAL POP UP -->
						<div class="modal" v-show="showConfirmation">
						  <div class="confirm-modalCard">
							<h1 class="modal-cart-title">Order Confirmation</h1>
							<p>Thank you for your purchase!</p>
							<button @click="closeConfirmationAndCart" class="tab-checkout-confirm">Close</button>
						  </div>
						</div>
						
						<!-- ERROR MODAL POP UP -->
						<div class="modal" v-show="showError">
						  <div class="error-modalCard">
							<h1 class="modal-cart-title">Whoops!</h1>
							<p>{{ errorMessage }}</p>
							<button @click="closeError" class="tab-checkout">Close</button>
						  </div>
						</div>

					</div>
				</div>

				<!-- PRODUCT CARD -->
				<div class="products-grid">

					<!-- ITERATE THROUGH PRODUCTS -->
					<div class="product" v-for="product in products" :key="product.id">
						<div class="card">
							<div class="product-image">

								<!-- IMAGE OF THE PRODUCT -->
								<img v-bind:src="product.image" alt="Product Image" class="product-image"/>
							</div>

							<!-- PRODUCT NAME -->
							<h1>{{ product.item }}</h1>
							<div class="product-info">

							<!-- PRODUCT CARD - LEFT SIDE -->
								<div class="product-info-left">
									<div class="cart-options">
										<h2>Buy now!</h2>

										<!-- SIZE SELECTOR -->
										<label for="size">Size:</label>
										<select id="size" v-model="product.selectedSize">
											<option v-for="size in product.sizes" :key="size">{{ size }}</option>
										</select>
										<br>

										<!-- QUANTITY SELECTOR -->
										<label for="quantity">Qty:</label>
										<select v-model="product.quantity">
											<option value="1">1</option>
											<option value="2">2</option>
											<option value="3">3</option>
										</select>
										<br><br><br>

										<!-- ADD TO CART -->
										<button class="tab-add-to-cart" @click="addToCart(product)" :disabled="!product.inStock || product.quantity < 1">Add to Cart</button>
									</div>
								</div>

								<!-- PRODUCT CARD - RIGHT SIDE -->
								<div class="product-info-right">

									<!-- STOCK STATUS -->
									<p v-if="product.inStock">In Stock</p>
									<p v-else>Out of Stock</p>

									<!-- PRICE AND SHIPPING -->
									<p>Price: &dollar;{{ product.price }}</p>
									<p>Standard Shipping: &dollar;{{ product.shippingCost }}</p>

									<!-- PRODUCT DETAILS/MATERIALS -->
									<ul>
										<li v-for="detail in product.details" :key="detail">{{ detail }}</li>
									</ul>
										<br>
									<div class="tab" @click="selectTab('product.reviews', product.id)" :class="{ 'active-tab': isActiveTab('product.reviews', product.id) }">Reviews</div>
										<br>
									<div class="tab" @click="selectTab('product.add-review', product.id)" :class="{ 'active-tab': isActiveTab('product.add-review', product.id) }">Add Review</div>
								</div>
							</div>
						
						<!-- TABS FOR REVIEW / ADD REVIEW -->
						<p class="product-tabs">
							<div v-show="selectedTab[product.id] === 'product.reviews'" class="product-reviews">
								<div class="close-button-container">
									<button @click="closeTab(product.id)" class="close-button">
										<img src="images/close.svg" height="20px" alt="Close">
									</button>
								</div>

								<!-- DISPLAY PRODUCT REVIEWS -->
								<h2>Product Reviews</h2>
								<ul>
									<li v-for="review in product.reviews">
									<p>
										{{ currentDate }}<br>
										<span v-for="i in Math.round(review.rating)" :key="i" class="display-review-star">✪</span><br>
										{{ review.name }} says: "{{ review.review }}"
									</p>
									</li>
								</ul>
							</div>
							<div v-show="selectedTab[product.id] === 'product.add-review'" class="review-form">
								<div class="close-button-container">
									<button @click="closeTab(product.id)" class="close-button">
										<img src="images/close.svg" height="20px" alt="Close">
									</button>
								</div>
						</p>
						<br>

						<!-- DISPLAY REVIEW FORM -->
						<h2>Leave a Review!</h2>
						<form @submit.prevent="submitReview(product)">
							<label for="rating">Rating:</label>
								<br>
							<div class="rating-review-star">
								<span
									id="star"
									v-for="i in 5"
									:key="i"
									@click="setStarRating(product, i)"
									@mouseover="hoverStar(i)"
									@mouseleave="resetHoveredStars"
									:class="{ 'filled': i <= product.newReview.rating, 'hovered': i <= hoveredStars }">
										{{ i <= hoveredStars || i <= product.newReview.rating ? '✪' : '&starf;' }}
								</span>
							</div>
								<br>
							<label for="name">Name:</label>
							<input type="text" id="name" v-model="product.newReview.name" class="review-input" required>
								<br>
							<label for="review">Review:</label>
							<textarea id="review" v-model="product.newReview.review" class="review-textarea" required></textarea>
								<div v-if="!product.newReview.rating" class="pop-up-message">
									Please select a star rating before submitting.
								</div>
							<button type="submit" class="tab-submit" :disabled="!product.newReview.rating">Submit</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	`,
	data() {
		return {
			//FLAGS FOR MODALS AND MESSAGES
			showCart: false,
			showConfirmation: false,
			showError: false,
			errorMessage: '',
			hoveredStars: 0,

			//ARRAY OF PRODUCTS
			/* The products component is keeping track of multiple items that are listed, 
			their ID, name, costs, etc. Also keeps track if the product review tab for this 
			specific item is selected or not. Using this information, it can then manage data
			within the shopping cart and reviews sections throughout the website. */
			products: [
				{
					id: 1,
					item: 'Quirky B&W Stripe',
					image: 'images/sock1.jpeg',
					reviews: [],
					newReview: {
						name: '',
						review: '',
						rating: null,
					},
					inStock: true,
					price: 15.99,
					sizes: ['S', 'M', 'L', 'XL'],
					details: ['60% Cotton', '20% Elastine', '20% Merino'],
					shippingCost: 2.99,
					cartItemCount: 0,
					quantity: 0,
					selectedTab: 'product.add-review',
				},
				{
					id: 2,
					item: 'Classic Tube',
					image: 'images/sock2.jpeg',
					reviews: [],
					newReview: {
						name: '',
						review: '',
						rating: null,
						},
					inStock: true,
					price: 12.99,
					sizes: ['S', 'M', 'L', 'XL'],
					details: ['40% Cotton', '10% Elastine', '50% Merino'],
					shippingCost: 2.99,
					cartItemCount: 0,
					quantity: 0,
					selectedTab: 'product.add-review',
				},
				{
					id: 3,
					item: 'Minimal Stripe',
					image: 'images/sock3.jpeg',
					reviews: [],
					newReview: {
						name: '',
						review: '',
						rating: null,
						},
					inStock: true,
					price: 11.99,
					sizes: ['S', 'M', 'L', 'XL'],
					details: ['45% Cotton', '30% Wool', '25% Bamboo'],
					shippingCost: 2.99,
					cartItemCount: 0,
					quantity: 0,
					selectedTab: 'product.add-review',
				},
				{
					id: 4,
					item: 'Casual B&W Stripe',
					image: 'images/sock4.jpeg',
					reviews: [],
					newReview: {
						name: '',
						review: '',
						rating: null,
						},
					inStock: true,
					price: 12.99,
					sizes: ['S', 'M', 'L', 'XL'],
					details: ['40% Wool', '35% Bamboo', '25% Silk'],
					shippingCost: 2.99,
					cartItemCount: 0,
					quantity: 0,
					selectedTab: 'product.add-review',
				},
				{
					id: 5,
					item: 'Out There Polka Dot',
					image: 'images/sock5.jpeg',
					reviews: [],
					newReview: {
						name: '',
						review: '',
						rating: null,
						},
					inStock: true,
					price: 12.99,
					sizes: ['S', 'M', 'L', 'XL'],
					details: ['35% Bamboo', '40% Silk', '25% Polyester'],
					shippingCost: 2.99,
					cartItemCount: 0,
					quantity: 0,
					selectedTab: 'product.add-review',
			 	},
			  	{
					id: 6,
					item: 'Ramsay Plaid',
					image: 'images/sock6.jpeg',
					reviews: [],
					newReview: {
						name: '',
						review: '',
						rating: null,
						},
					inStock: true,
					price: 15.99,
					sizes: ['S', 'M', 'L', 'XL'],
					details: ['25% Silk', '45% Polyester', '30% Nylon'],
					shippingCost: 2.99,
					cartItemCount: 0,
					quantity: 0,
					selectedTab: 'product.add-review',
			  	},
			  	{
					id: 7,
					item: 'Pink Mono Stripe',
					image: 'images/sock7.jpeg',
					reviews: [],
					newReview: {
						name: '',
						review: '',
						rating: null,
						},
					inStock: true,
					price: 12.99,
					sizes: ['S', 'M', 'L', 'XL'],
					details: ['30% Polyester', '25% Nylon', '45% Cotton'],
					shippingCost: 2.99,
					cartItemCount: 0,
					quantity: 0,
					selectedTab: 'product.add-review',
			 	},
			  	{
					id: 8,
					item: 'Yellow Eggs',
					image: 'images/sock8.jpeg',
					reviews: [],
					newReview: {
						name: '',
						review: '',
						rating: null,
						},
					inStock: true,
					price: 15.99,
					sizes: ['S', 'M', 'L', 'XL'],
					details: ['25% Nylon', '25% Cotton', '50% Wool'],
					shippingCost: 2.99,
					cartItemCount: 0,
					quantity: 0,
					selectedTab: 'product.add-review',
				}
			],

			//DATE FORMATTING AND SELECTION FOR REVIEWS
			currentDate: new Date().toLocaleDateString('en-GB'),
			selectedTab: {},
		};
	},	
	methods: {
		//SUBMIT NEW REVIEW 
		/* This feature will take the product information from the product list. 
		It will make sure that the review name, review, and rating are not empty.
		Then will "push" that information into the review submitted array of 
		that specified product. I have added in the functionality that when a review 
		is submitted, it will automatically switch to the reviews tab where the user 
		will see their review. */
		submitReview(product) {
			if (product.newReview.name && product.newReview.review && product.newReview.rating !== null) {
				product.reviews.push({
					name: product.newReview.name,
					review: product.newReview.review,
					rating: product.newReview.rating,
					date: this.currentDate,
				});
				product.newReview.name = '';
				product.newReview.review = '';
				product.newReview.rating = null;
		
				EventBus.$emit('review-submitted', product.id);
			}
			//SWITCH TO REVIEWS TAB WHEN A NEW REVIEW IS SUBMITTED
			this.switchToReviewsTab(product.id);
		},

		//PRODUCT TABS
		/* This code will set which tab is selected when it is manually selected. 
		By using close tab, it will make sure that the tab for that specific tab is 
		not selected and not conflicting with the open tab. It keeps track of 
		which tab is active, and there is a feature to automatically switch 
		to the reviews tab when the submit button is clicked within the submit review tab.
		*/
		selectTab(tabName, productId) {
			this.$set(this.selectedTab, productId, tabName);
		},
		closeTab(productId) {
			this.$set(this.selectedTab, productId, null);
		},
		isActiveTab(tabName, productId) {
			return this.selectedTab[productId] === tabName;
		},
		//SWITCH TO REVIEWS TAB MANUALLY WITH TAB
		switchToReviewsTab(productId) {
			this.$set(this.selectedTab, productId, 'product.reviews');
		},


		//CART
		/* The Cart component is quite extensive due to a lot of calculations and factors
		to consider (adding, removing, updating, premium status, etc.)
		Overall, it will add an item to the cart while updating the cart quantity to
		what is specified by the user. It will use this to also update the cart based on that
		products cost, and the quantity for that item specifically. There is a remove from 
		cart feature also which removes the information from the cart array. There are more
		features including clear cart, cart checkout, error messages if cart is empty and the user
		wants to checkout. I've also included update methods for changing size and quantity while 
		items are in the cart which includes modal pop ups and close button methods. */
		//ADD PRODUCT TO CART
		addToCart(product) {
			if (product.inStock) {
				const cartItem = {
					id: product.id,
					name: product.item,
					size: product.selectedSize,
					quantity: parseFloat(product.quantity),
					price: parseFloat(product.price),
					premiumMembership: product.premiumMembership, // Preserve the original premiumMembership
				};
				this.cart.push(cartItem);
		
				// Update cart item count
				this.cartItemCount += parseFloat(product.quantity);
		
				// Update total cost based on premium status
				this.totalCartCost = this.calculateTotalCartCost();
			}
		},

		//REMOVE PRODUCT FROM CART
		removeFromCart(index) {
			if (index >= 0) {
				this.cartItemCount -= this.cart[index].quantity; // Update cartItemCount
				this.cart.splice(index, 1); // Remove the item from the cart array
				this.totalCartCost = this.calculateTotalCartCost();
			}
		},

		//SET THE QUANTITY MAX NUMBER IN THE CART
		getQuantityOptions() {
			return Array.from({ length: 3 }, (_, i) => i + 1);
		},

		//REMOVE ALL ITEMS FROMCART
		clearCart() {
			this.cart = [];
			this.cartItemCount = 0;
		},

		//CALCULATE COST OF ITEMS IN CART BASED ON QUANTITY
		cartItemCost(item) {
			return '$' + (item.price * item.quantity).toFixed(2); // Format to 2 decimal places
		},

		//CALCULATE TOTAL CART QUANTITY
		calculateCartItemCount() {
			return this.cart.reduce((total, item) => total + parseInt(item.quantity), 0);
		},
		
		//SET CART COST AS 0 IF NO ITEMS ARE IN CART
		calculateTotalCartCost() {
				if (this.cart.length === 0) {
				return 0;
			}
		  
			//CALCULATE CART COST BASED ON PREMIUM STATUS
			const cartSubtotals = this.cart.map(item => parseFloat(item.price) * parseFloat(item.quantity));
			const totalCartCost = cartSubtotals.reduce((total, subtotal) => total + subtotal, 0);

			//IF NO PREMIUM ADD SHIPPING COST
			return totalCartCost + (this.premiumMembership ? 0 : 2.99);
		},

		//SIZES FOR CART UPDATE OPTION
		getProductSizes(productId) {
			const product = this.products.find(product => product.id === productId);
			return product ? product.sizes : [];
		},

		//VALIDATE AND UPDATE THE QUANTITY IN THE CART
		updateCartItem(index) {
			const item = this.cart[index];
				if (item.quantity < 1) {
				item.quantity = 1;
				}
			this.$set(this.cart, index, item);
			this.updateCart();
		},

		//UPDATE CART COSTS AND ITEM COUNT
		updateCart() {
			this.cartItemCount = this.calculateCartItemCount();
			this.totalCartCost = this.calculateTotalCartCost();
		},

		//ERROR MESSAGE IF CART IS EMPTY
		checkout() {
			if (this.cart.length === 0) {
				this.showError = true;
			  	this.errorMessage = 'Looks like there are no items in the cart. Please add items before checking out.';
			  	return;
			}
			//IF CART HAS ITEMS SHOW ORDER CONFIRMATION MESSAGE
			this.showConfirmation = true;
		},
 
		  //CLOSE CONFIRMATION MODAL
		closeConfirmation() {
			this.showConfirmation = false;
			this.clearCart();
		},

		//CLOSE CART MODAL AND CLEAR CART WHEN ORDER IS CONFIRMED
		closeConfirmationAndCart() {
			this.$emit('close-confirmation-and-cart');
			this.showConfirmation = false;
			this.showCart = false;
			this.clearCart();
		},

		//CLOSE ERROR MESSAGE MODAL
		closeError() {
			this.showError = false;
		},

		//STAR RATINGS
		hoverStar(starCount) {
			this.hoveredStars = starCount;
		},
		resetHoveredStars() {
			this.hoveredStars = 0;
		},
		setStarRating(product, selectedRating) {
			this.$set(product.newReview, 'rating', selectedRating);
		},

		//OPEN AND CLOSE CART MODAL
		toggleCartOn() {
			this.showCart = true;
		},
		toggleCartOff() {
			this.showCart = false;
		}
	},

	computed: {
		//CALCULATE SHIPPING COSTS
		shipping() {
			const shippingCostPerItem = 2.99;
			const totalShippingCost = this.cartItemCount * shippingCostPerItem;
			return this.premiumMembership ? 'Free' : `$${totalShippingCost.toFixed(2)}`;
		},

		//CALCULATE ITEM COUNT
		cartItemCount() {
			return this.cart.reduce((total, item) => total + parseInt(item.quantity), 0);
		},
		//CALCULATE CART SUBTOTAL
		cartSubtotals() {
			return this.cart.map(item => parseFloat(item.price) * parseFloat(item.quantity));
		},

		//CALCULATE TOTAL COST BASED ON ITEMS AND PREMIUM STATUS
		totalCartCost() {
			if (this.cart.length === 0) {
				return 0;
			}
			const cartSubtotals = this.cart.map(item => parseFloat(item.price) * parseFloat(item.quantity));
			const totalCartCost = cartSubtotals.reduce((total, subtotal) => total + subtotal, 0);
			return totalCartCost + (this.premiumMembership ? 0 : 2.99);
		  },

		// FORMAT TOTAL COST WITH 2 DECIMALS AND $
		totalCartCostFormatted() {
			const formattedTotal = this.totalCartCost.toFixed(2); // Format to 2 decimal places
			return '$' + formattedTotal; // Add the dollar sign
		},

		//ARRAY OF RATINGS FOR EACH PRODUCT
		selectedRating() {
			return this.products.map(product => product.newReview.rating);
		},
	}
});

// VUE INSTANCE
/* This will bind the vue code to the HTML element within index.html. It also has a watch
for the premium membership property. It can switch the flag depending on if the
checkbox is ticked. There is also a listener for when a review is submitted for a specific
product.
*/
new Vue({
    el: '#app',
    data: {
        cart: [],
        currentDate: new Date().toLocaleDateString(),
        premiumMembership: false,
        showPremiumMessage: false,
    },
    mounted() {
		//WATCH FOR PREMIUM MEMBERSHIP STATUS
        this.$watch('premiumMembership', (newVal, oldVal) => {
            if (newVal !== oldVal) {
                this.showPremiumMessage = true;
            }
        });

        //LISTEN FOR REVIEW SUBMITTED
        EventBus.$on('review-submitted', (productId) => {
            console.log(`Review submitted for product ${productId}`);
        });
    },
});