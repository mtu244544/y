// Function to create a RecentActivities data structure

    const activities = [];
  
    // Function to add a new activity to the list
    function addActivity(activity) {
      activities.unshift(activity); // Add at the beginning of the array
      if (activities.length > 2) {
        activities.pop(); // Remove the oldest activity if more than 3
      }
    }
  
    // Function to get the recent activities
    function getRecentActivities() {
      return activities;
    }
  
    // Return an object with the necessary functions
    module.exports = {
      addActivity,
      getRecentActivities
    };
  