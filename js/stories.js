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

function getStar (story) {
  console.debug('getStar')
  const favBtn = currentUser ? getCorrectStarForStory(story) : "";
  return favBtn
}



function getCorrectStarForStory (story){
  console.debug("getCorrectStarForStory", currentUser)
  const currStoryId = story.storyId;

  const isUserFavorite = currentUser.favorites.find(
    story => story.storyId === currStoryId);

  console.log(isUserFavorite);

  const starClass = isUserFavorite ? "-fill" : "";

  const starHtml = `
  <i class="bi bi-star${starClass}"></i>`;


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

async function putSubmittedStoryOnPage (evt) {
  evt.preventDefault();

  //get form data
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();

  //make object for data needed in addStory
  const storyData = {title, url, author};

  //pass storyData into .addStory which calls the API
  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);

  //add to page
  $allStoriesList.prepend($story);

  //reset page and form
  $storyForm.toggleClass("hidden");
  $storyForm.trigger('reset');
}

$storyForm.on("submit", putSubmittedStoryOnPage)