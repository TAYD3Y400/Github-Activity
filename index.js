async function fetchGitHubActivity(username) {
    const response = await fetch(
      `https://api.github.com/users/${username}/events`,
      {
        headers: {
          "User-Agent": "node.js",
        },
      },
    );
  
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("User not found. Check the username.");
      }
      if (response.status === 503) {
        throw new Error("Service unavailable right now. Try again later.");
      }
      throw new Error(`Error fetching data: ${response.status}`);
    }
    const events = await response.json();
    return events;
}

function displayEvents(events){
  var lastPush;
  var lastDate;
  var count = 0;
    for (const event of events){
      const date = new Date(event.created_at);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      switch (event.type){
          case 'PushEvent':
            if ((lastPush !== event.repo.name || lastDate !== formattedDate) && lastPush){
              console.log("Pushed " +count+ " commits to "+lastPush);
              count = 0;
            }
            lastDate = formattedDate;
            lastPush = event.repo.name;
            count+=1;
            break;
          case 'CreateEvent':
            if (event.payload.ref_type === "branch"){
              console.log("Branch "+ event.payload.master_branch+" created at "+event.repo.name);
              break;
            }
            if (event.payload.ref_type === "repository"){
              console.log("Started a new repository: "+ event.repo.name); 
              break;
            }
          case 'WatchEvent':
            console.log("Starred "+ event.repo.name); 
            break;
          case 'DeleteEvent':
            console.log(event.payload.ref_type+" "+event.payload.ref+" deleted from "+event.repo.name);
            break;
          case 'IssuesEvent':
            console.log("Issue ["+event.payload.issue.title+"] "+event.payload.action+" at "+event.repo.name);
            break;
      }
    }
    console.log("Pushed " +count+ " commits to "+lastPush);
}

const username = process.argv[2];
fetchGitHubActivity(username).then(events => displayEvents(events)).catch( err => console.log(err))
