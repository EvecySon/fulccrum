# Reviews & Ratings System - Complete Guide

## 🎉 Reviews & Ratings Implemented!

Complete review and rating system for customers to rate their orders, businesses, and drivers. Includes detailed ratings, business responses, and automatic rating calculations.

---

## 📊 What's Been Implemented

### Database Model
**Review** - Comprehensive review system with:
- Overall rating (1-5 stars)
- Detailed ratings (food quality, service, delivery speed, value)
- Text comments and images
- Business responses
- Moderation features
- Helpful votes

### API Endpoints (10)

#### Customer Reviews (3)
- `POST /reviews` - Create review for order
- `GET /reviews/customer/my-reviews` - Get customer's reviews
- `PATCH /reviews/:id/helpful` - Mark review as helpful

#### Business Reviews (4)
- `GET /reviews/business/:businessId` - Get business reviews
- `GET /reviews/business/:businessId/stats` - Get rating statistics
- `POST /reviews/:id/respond` - Business responds to review

#### Driver Reviews (1)
- `GET /reviews/driver/:driverId` - Get driver reviews

#### Admin/Moderation (2)
- `PATCH /reviews/:id/hide` - Hide inappropriate review
- `PATCH /reviews/:id/unhide` - Unhide review

---

## 🧪 Testing Reviews & Ratings

### 1. Create Review (Customer)

```bash
POST http://localhost:3001/reviews
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "orderId": "order-uuid",
  "rating": 5,
  "foodQuality": 5,
  "serviceQuality": 4,
  "deliverySpeed": 5,
  "valueForMoney": 5,
  "comment": "Amazing jollof rice! Best I've had in Lagos. Delivery was super fast and the driver was very professional.",
  "images": ["https://example.com/food-photo.jpg"]
}
```

**Response:**
```json
{
  "id": "review-uuid",
  "orderId": "order-uuid",
  "customerId": "customer-uuid",
  "businessId": "business-uuid",
  "driverId": "driver-uuid",
  "rating": 5,
  "foodQuality": 5,
  "serviceQuality": 4,
  "deliverySpeed": 5,
  "valueForMoney": 5,
  "comment": "Amazing jollof rice! Best I've had in Lagos...",
  "images": ["https://example.com/food-photo.jpg"],
  "isVerified": true,
  "isHidden": false,
  "helpfulCount": 0,
  "createdAt": "2026-02-06T23:50:00.000Z",
  "updatedAt": "2026-02-06T23:50:00.000Z"
}
```

**Validations:**
- ✅ Order must exist and belong to customer
- ✅ Order must be delivered
- ✅ Can only review once per order
- ✅ Rating must be 1-5
- ✅ Automatically updates business and driver ratings

### 2. Get Business Reviews

```bash
GET http://localhost:3001/reviews/business/<business-id>?page=1&limit=20&minRating=4
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "review-uuid",
      "rating": 5,
      "foodQuality": 5,
      "serviceQuality": 4,
      "deliverySpeed": 5,
      "valueForMoney": 5,
      "comment": "Amazing jollof rice!...",
      "images": ["https://example.com/food-photo.jpg"],
      "helpfulCount": 12,
      "businessResponse": "Thank you so much! We're glad you enjoyed it!",
      "respondedAt": "2026-02-07T10:00:00.000Z",
      "createdAt": "2026-02-06T23:50:00.000Z",
      "customer": {
        "firstName": "John",
        "lastName": "Doe",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "order": {
        "orderNumber": "ORD-12345",
        "deliveredAt": "2026-02-06T22:30:00.000Z"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "stats": {
    "averageRating": 4.7,
    "totalReviews": 156,
    "ratingDistribution": {
      "5": 98,
      "4": 42,
      "3": 12,
      "2": 3,
      "1": 1
    },
    "averageFoodQuality": 4.8,
    "averageServiceQuality": 4.6,
    "averageDeliverySpeed": 4.5,
    "averageValueForMoney": 4.7
  }
}
```

### 3. Get Business Rating Statistics

```bash
GET http://localhost:3001/reviews/business/<business-id>/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "averageRating": 4.7,
  "totalReviews": 156,
  "ratingDistribution": {
    "5": 98,
    "4": 42,
    "3": 12,
    "2": 3,
    "1": 1
  },
  "averageFoodQuality": 4.8,
  "averageServiceQuality": 4.6,
  "averageDeliverySpeed": 4.5,
  "averageValueForMoney": 4.7
}
```

### 4. Business Responds to Review

```bash
POST http://localhost:3001/reviews/<review-id>/respond
Authorization: Bearer <business-owner-token>
Content-Type: application/json

{
  "businessResponse": "Thank you so much for your wonderful review! We're thrilled you enjoyed our jollof rice. We look forward to serving you again soon!"
}
```

### 5. Get Driver Reviews

```bash
GET http://localhost:3001/reviews/driver/<driver-id>?page=1&limit=20
Authorization: Bearer <token>
```

### 6. Get Customer's Reviews

```bash
GET http://localhost:3001/reviews/customer/my-reviews?page=1&limit=20
Authorization: Bearer <customer-token>
```

### 7. Mark Review as Helpful

```bash
PATCH http://localhost:3001/reviews/<review-id>/helpful
Authorization: Bearer <token>
```

### 8. Hide Review (Admin/Moderation)

```bash
PATCH http://localhost:3001/reviews/<review-id>/hide
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "moderationNotes": "Contains inappropriate language"
}
```

---

## 📱 Mobile App Integration

### React Native - Display Reviews

```javascript
import { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';

const BusinessReviews = ({ businessId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://api.fulccrum.com/reviews/business/${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setReviews(data.data);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.header}>
        <Image source={{ uri: item.customer.avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={styles.customerName}>
            {item.customer.firstName} {item.customer.lastName}
          </Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.rating}>{renderStars(item.rating)}</Text>
      </View>

      <Text style={styles.comment}>{item.comment}</Text>

      {item.images.length > 0 && (
        <ScrollView horizontal>
          {item.images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}

      {item.businessResponse && (
        <View style={styles.response}>
          <Text style={styles.responseLabel}>Business Response:</Text>
          <Text style={styles.responseText}>{item.businessResponse}</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => markHelpful(item.id)}>
        <Text style={styles.helpful}>
          👍 Helpful ({item.helpfulCount})
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.averageRating}>{stats.averageRating} ⭐</Text>
          <Text style={styles.totalReviews}>{stats.totalReviews} reviews</Text>
          
          <View style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((star) => (
              <View key={star} style={styles.ratingBar}>
                <Text>{star} ⭐</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${(stats.ratingDistribution[star] / stats.totalReviews) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text>{stats.ratingDistribution[star]}</Text>
              </View>
            ))}
          </View>

          <View style={styles.detailedRatings}>
            <Text>🍽️ Food Quality: {stats.averageFoodQuality}</Text>
            <Text>👨‍💼 Service: {stats.averageServiceQuality}</Text>
            <Text>🚗 Delivery Speed: {stats.averageDeliverySpeed}</Text>
            <Text>💰 Value: {stats.averageValueForMoney}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};
```

### Create Review Form

```javascript
const CreateReviewScreen = ({ orderId, navigation }) => {
  const [rating, setRating] = useState(5);
  const [foodQuality, setFoodQuality] = useState(5);
  const [serviceQuality, setServiceQuality] = useState(5);
  const [deliverySpeed, setDeliverySpeed] = useState(5);
  const [valueForMoney, setValueForMoney] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);

  const submitReview = async () => {
    try {
      const response = await fetch('http://api.fulccrum.com/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          rating,
          foodQuality,
          serviceQuality,
          deliverySpeed,
          valueForMoney,
          comment,
          images,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Thank you for your review!');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rate Your Order</Text>

      <StarRating
        label="Overall Rating"
        rating={rating}
        onRatingChange={setRating}
      />

      <StarRating
        label="Food Quality"
        rating={foodQuality}
        onRatingChange={setFoodQuality}
      />

      <StarRating
        label="Service Quality"
        rating={serviceQuality}
        onRatingChange={setServiceQuality}
      />

      <StarRating
        label="Delivery Speed"
        rating={deliverySpeed}
        onRatingChange={setDeliverySpeed}
      />

      <StarRating
        label="Value for Money"
        rating={valueForMoney}
        onRatingChange={setValueForMoney}
      />

      <TextInput
        style={styles.commentInput}
        placeholder="Share your experience..."
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
      />

      <Button title="Add Photos" onPress={pickImages} />

      <Button title="Submit Review" onPress={submitReview} />
    </ScrollView>
  );
};
```

---

## 🎯 Features

### For Customers
- ✅ Rate orders after delivery (1-5 stars)
- ✅ Detailed ratings (food, service, delivery, value)
- ✅ Add comments and photos
- ✅ View their review history
- ✅ Mark helpful reviews
- ✅ One review per order

### For Businesses
- ✅ View all reviews with filtering
- ✅ See detailed rating statistics
- ✅ Rating distribution breakdown
- ✅ Respond to customer reviews
- ✅ Automatic rating calculation
- ✅ Average ratings for different aspects

### For Drivers
- ✅ View their delivery ratings
- ✅ Automatic rating updates
- ✅ Based on delivery speed ratings

### For Admins
- ✅ Hide inappropriate reviews
- ✅ Add moderation notes
- ✅ Unhide reviews
- ✅ Monitor review quality

---

## 🔒 Security & Validation

### Review Creation
- ✅ Must be authenticated customer
- ✅ Can only review own orders
- ✅ Order must be delivered
- ✅ One review per order
- ✅ Rating must be 1-5
- ✅ Auto-verified for real customers

### Business Response
- ✅ Only business owner can respond
- ✅ Can only respond to own reviews
- ✅ Minimum 10 characters

### Moderation
- ✅ Admin-only access
- ✅ Moderation notes required
- ✅ Hidden reviews not shown to public

---

## 📊 Rating Calculations

### Business Rating
- Calculated from all non-hidden reviews
- Average of overall ratings
- Automatically updates on new review
- Stored in BusinessProfile.rating

### Driver Rating
- Calculated from delivery speed ratings
- Average of all delivery speed scores
- Automatically updates on new review
- Stored in DriverProfile.rating

### Statistics Include
- Average overall rating
- Total review count
- Rating distribution (5★, 4★, 3★, 2★, 1★)
- Average food quality
- Average service quality
- Average delivery speed
- Average value for money

---

## 🎨 UI/UX Best Practices

### Display Reviews
- Show most recent first
- Display customer name and avatar
- Show verified badge
- Include order date
- Display business responses
- Show helpful count

### Rating Display
- Use star icons (⭐)
- Show numerical rating (4.7/5.0)
- Display total review count
- Show rating distribution bars
- Highlight detailed ratings

### Review Form
- Simple star selection
- Optional detailed ratings
- Text area for comments
- Photo upload option
- Clear submission button

---

## 🚀 Use Cases

### Use Case 1: Customer Reviews Order
1. Customer receives delivered order
2. App prompts for review
3. Customer rates overall experience (5 stars)
4. Adds detailed ratings for food, service, delivery
5. Writes comment and uploads food photo
6. Submits review
7. Business and driver ratings auto-update

### Use Case 2: Business Responds
1. Business owner sees new review
2. Reads customer feedback
3. Writes thoughtful response
4. Thanks customer and addresses concerns
5. Response visible to all customers

### Use Case 3: Customer Browses Reviews
1. Customer views restaurant page
2. Sees 4.7★ average rating
3. Views rating distribution
4. Filters for 5-star reviews
5. Reads recent customer experiences
6. Makes informed ordering decision

---

## 📝 Database Schema

```
Review:
  id: UUID
  orderId: UUID (unique, FK to Order)
  customerId: UUID (FK to User)
  businessId: UUID (FK to BusinessProfile)
  driverId: UUID (optional, FK to User)
  
  rating: Integer (1-5)
  foodQuality: Integer (1-5, optional)
  serviceQuality: Integer (1-5, optional)
  deliverySpeed: Integer (1-5, optional)
  valueForMoney: Integer (1-5, optional)
  
  comment: Text (optional)
  images: JSON Array
  
  isVerified: Boolean
  isHidden: Boolean
  moderationNotes: Text (optional)
  
  businessResponse: Text (optional)
  respondedAt: DateTime (optional)
  
  helpfulCount: Integer
  
  createdAt: DateTime
  updatedAt: DateTime
```

---

## 🎯 Next Steps

### For Customers
1. Complete delivered orders
2. Leave honest reviews
3. Upload food photos
4. Help others with helpful votes

### For Businesses
1. Monitor reviews regularly
2. Respond to feedback
3. Address concerns professionally
4. Thank customers for positive reviews
5. Use feedback to improve

### For Developers
1. Integrate review prompts after delivery
2. Display ratings on business pages
3. Add review filtering and sorting
4. Implement photo galleries
5. Add review analytics

---

**Reviews & Ratings system is complete and production-ready! ⭐**
