GET https://jsonplaceholder.typicode.com/posts/1


POST https://dummyjson.com/products/add
Headers: { "Content-Type": "application/json" }
Body:
{
  "title": "Test Product"
}


DELETE https://dummyjson.com/products/1

PUT https://dummyjson.com/products/1
Headers: { "Content-Type": "application/json" }
Body:
{
  "title": "Updated Product"
}


/api/history?page=2&limit=10