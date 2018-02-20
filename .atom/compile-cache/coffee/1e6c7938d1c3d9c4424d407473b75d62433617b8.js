(function() {
  var beta, dev, prod;

  dev = {
    name: "localhost",
    imdoneKeyA: 'E4w10uxC3ov_WoaIqAXdEbzvD52I01Lr9_W1i44-bDVcAHKbBb9lAA==',
    imdoneKeyB: 'eAgZpLvqEDAIWLwliNjSdPFnMho=',
    pusherKey: '64354707585286cfe58f',
    pusherChannelPrefix: 'private-imdoneio-dev',
    baseUrl: 'http://localhost:3000'
  };

  beta = {
    name: 'beta.imdone.io',
    imdoneKeyA: 'WFuE-QDFbrN5lip0gdHyYAdXDMdZPerXFey02k93dn-HOYJXoAAdBA==',
    imdoneKeyB: 'ALnfTYYEtghJBailJ1n-7tx4hIo=',
    pusherKey: '0a4f9a6c45def222ab08',
    pusherChannelPrefix: 'private-imdoneio-beta',
    baseUrl: 'https://beta.imdone.io'
  };

  prod = {
    name: 'imdone.io',
    imdoneKeyA: 'X8aukodrNNHKGkMKGhtcU8lI4KvNdMxCkYUiKOjh3JjH1-zj0qIDPA==',
    imdoneKeyB: '7Bo_oUdtzJxeFhdnGrrVrtGHTy8=',
    pusherKey: 'ba1f2dde238cb1f5944e',
    baseUrl: 'https://imdone.io',
    pusherChannelPrefix: 'private-imdoneio'
  };

  module.exports = prod;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2NvbmZpZy9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxXQUFOO0lBQ0EsVUFBQSxFQUFZLDBEQURaO0lBRUEsVUFBQSxFQUFZLDhCQUZaO0lBR0EsU0FBQSxFQUFZLHNCQUhaO0lBSUEsbUJBQUEsRUFBcUIsc0JBSnJCO0lBS0EsT0FBQSxFQUFTLHVCQUxUOzs7RUFPRixJQUFBLEdBQ0U7SUFBQSxJQUFBLEVBQU0sZ0JBQU47SUFDQSxVQUFBLEVBQVksMERBRFo7SUFFQSxVQUFBLEVBQVksOEJBRlo7SUFHQSxTQUFBLEVBQVksc0JBSFo7SUFJQSxtQkFBQSxFQUFxQix1QkFKckI7SUFLQSxPQUFBLEVBQVksd0JBTFo7OztFQU9GLElBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxXQUFOO0lBQ0EsVUFBQSxFQUFZLDBEQURaO0lBRUEsVUFBQSxFQUFZLDhCQUZaO0lBR0EsU0FBQSxFQUFZLHNCQUhaO0lBSUEsT0FBQSxFQUFZLG1CQUpaO0lBS0EsbUJBQUEsRUFBcUIsa0JBTHJCOzs7RUFPRixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXhCakIiLCJzb3VyY2VzQ29udGVudCI6WyJkZXYgPVxuICBuYW1lOiBcImxvY2FsaG9zdFwiLFxuICBpbWRvbmVLZXlBOiAnRTR3MTB1eEMzb3ZfV29hSXFBWGRFYnp2RDUySTAxTHI5X1cxaTQ0LWJEVmNBSEtiQmI5bEFBPT0nXG4gIGltZG9uZUtleUI6ICdlQWdacEx2cUVEQUlXTHdsaU5qU2RQRm5NaG89J1xuICBwdXNoZXJLZXk6ICAnNjQzNTQ3MDc1ODUyODZjZmU1OGYnXG4gIHB1c2hlckNoYW5uZWxQcmVmaXg6ICdwcml2YXRlLWltZG9uZWlvLWRldidcbiAgYmFzZVVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCdcblxuYmV0YSA9XG4gIG5hbWU6ICdiZXRhLmltZG9uZS5pbydcbiAgaW1kb25lS2V5QTogJ1dGdUUtUURGYnJONWxpcDBnZEh5WUFkWERNZFpQZXJYRmV5MDJrOTNkbi1IT1lKWG9BQWRCQT09J1xuICBpbWRvbmVLZXlCOiAnQUxuZlRZWUV0Z2hKQmFpbEoxbi03dHg0aElvPSdcbiAgcHVzaGVyS2V5OiAgJzBhNGY5YTZjNDVkZWYyMjJhYjA4J1xuICBwdXNoZXJDaGFubmVsUHJlZml4OiAncHJpdmF0ZS1pbWRvbmVpby1iZXRhJ1xuICBiYXNlVXJsOiAgICAnaHR0cHM6Ly9iZXRhLmltZG9uZS5pbydcblxucHJvZCA9XG4gIG5hbWU6ICdpbWRvbmUuaW8nXG4gIGltZG9uZUtleUE6ICdYOGF1a29kck5OSEtHa01LR2h0Y1U4bEk0S3ZOZE14Q2tZVWlLT2poM0pqSDEtemowcUlEUEE9PSdcbiAgaW1kb25lS2V5QjogJzdCb19vVWR0ekp4ZUZoZG5HcnJWcnRHSFR5OD0nXG4gIHB1c2hlcktleTogICdiYTFmMmRkZTIzOGNiMWY1OTQ0ZSdcbiAgYmFzZVVybDogICAgJ2h0dHBzOi8vaW1kb25lLmlvJ1xuICBwdXNoZXJDaGFubmVsUHJlZml4OiAncHJpdmF0ZS1pbWRvbmVpbydcblxubW9kdWxlLmV4cG9ydHMgPSBwcm9kO1xuIl19
