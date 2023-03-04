"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  //check if current user logged in

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${getStar(story)}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//OLD SOLUTION: CAN TURN INTO TERINARY
// function getStar (story){
//   if (currentUser){
//     const correctStar = getCorrectStarForStory(story);
//   }
//   return "";
// }

/**Returns HTML regarding star functionality
 * Return empty string if user is not logged in
 * Return filled star for user favorites,
 * empty star for user unfavorites
 */

function getStar(story) {

  const favBtn = currentUser ? getCorrectStarForStory(story) : "";
  return favBtn;
}


/**Returns HTML to create filled star for favorite story
 * and unfilled star for non-favorite stories
 */
function getCorrectStarForStory(story) {
  console.debug("getCorrectStarForStory");
  const currStoryId = story.storyId;

  const isUserFavorite = currentUser.favorites.find(
    story => story.storyId === currStoryId);

  const starClass = isUserFavorite ? "-fill" : "";

  const starHtml = `
  <i class= "bi bi-star${starClass} star-btn"></i>`; //bootstrap icon

  return starHtml;
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**
 * Get data from story form,
 * add story to page,
 * hide and clear form
 */

async function putSubmittedStoryOnPage(evt) {
  evt.preventDefault();

  //get form data
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();

  //make object for data needed in addStory
  const storyData = { title, url, author };

  //pass storyData into .addStory which calls the API
  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);

  //add to page
  $allStoriesList.prepend($story);

  //reset page and form
  $storyForm.toggleClass("hidden");
  $storyForm.trigger('reset');
}

$storyForm.on("submit", putSubmittedStoryOnPage);

/** displays favorited stories when 'favorites' is clicked on in nav bar*/
function putFavoritesOnPage() {
  console.debug('putFavoriteOnPage ran');
  //clear old html bc it is a dynamic page
  $favStoriesList.empty();

  const userFavorites = currentUser.favorites;

  for (let story of userFavorites) {

    const $story = generateStoryMarkup(story);
    $favStoriesList.append($story);
  }

  $favStoriesList.show();
}

/**Changes HTML and API for favorited/unfavorites stories:
 * toggle star display, updates user.favorites in API
 */

async function changeFavoriteStory(evt) {
  console.debug("changeFavoriteStory", evt);

  const $star = $(evt.target);
  const $storyLiHtml = $star.closest("li");

  //need to turn ID into story, methods addFavorite and removeFavorite
  //take story instances as inputs
  const storyId = $storyLiHtml.attr("id");
  const story = await Story.getStoryById(storyId);

  //check if story is favorite
  const isUserFavorite = currentUser.favorites.find(
    story => story.storyId === storyId);

  if (isUserFavorite) {
    await currentUser.removeFavorite(story);
    $star.toggleClass("bi-star-fill bi-star");
  }
  else {
    await currentUser.addFavorite(story);
    $star.toggleClass("bi-star bi-star-fill");
  }


}

//add and remove favorites from both homepage and favoritelist
$allStoriesList.on("click", ".star-btn", changeFavoriteStory);
$favStoriesList.on("click", ".star-btn", changeFavoriteStory);
