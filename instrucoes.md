
Prompts Replit.md

Página
1
/
1
100%
# Opening Prompt
I want you to read the attached documentation and come up with a plan to build out a modern web application and browser extension called Bookmark. 

The app and extension should be very lightweight and super easy to use following best practices for Manifest 3 Chrome extensions and making sure that our auth and UI components are simple and easy to reuse across both the web application and the extension so that we don't duplicate code and keep things performant and optimized.

Theme: use #9C64FB as our primary accent color with #111111 as a complimentary/background color
Also use the provided icons for the extension and branding
Icons for extension attached. 

----------

# Prompt

I’m building a simple, modern bookmark web application and extension with seamless user authentication across the web app and the extension, called ‘Bookmark”.

Goal: Create a web app that lets users save and organize bookmarks.

# Primary User Story
“As a logged-in user, I can quickly save a URL with an optional short note and/or a few tags. I should later be able to easily find that bookmark using search and filters.”

# User Journeys:

**Creating Account**
- User lands in /signup page
- Enters email and password (6+ characters)
- Hits signup button
- Is redirected to /home

**Login**
- User lands in /login page
- Enters email and password
- Hits login button
- Is redirected to /home

**Creating a bookmark (web)**
- In /home, user clicks ‘new bookmark’ button
- In new bookmark modal, user enters url, title, description (optional) and source (X, Youtube, etc)
- User either chooses existing categories tags for the bookmark or creates new ones in a shadcn command component 
- Hit save button in modal and, new bookmark record is created and modal closes, revealing a new bookmark record in /home 

**Creating a bookmark (extension)**
- User logs in or signs up in the extension sidebar and is redirected to /home
- User navigates to URL he wants to bookmark 
- User clicks “new bookmark” button 
- System automatically gets URL, title and source from webpage and fills the new bookmark form
- User manually selects existing or creates new category tags and adds a description 
- Hit save button in modal and, new bookmark record is created and modal closes, revealing a new bookmark record in /home

**Editing/ Deleting Bookmarks**
- User is in /home and sees a … icon on the right handside of bookmark record
- Clicks it, and sees ‘update’ and ‘delete’ options in a dropdown menu
- When user clicks ‘update’, he should be able to edit the record (sees same new bookmark modal) 
- When user clicks delete, the record is deleted.

**Finding bookmarks** 
- When user is in /home, he sees a list of all his bookmarks in a table with bookmark title, description, source, categories, date added, date modified 
- User can filter bookmarks per category and date added
- User can search bookmarks by title or source metadata as well

# Information Architecture
- User owns all data/ can only see his own bookmark records
- Bookmark table: { id, ownerId, url (required), title (auto-fetch open graph details and any other available public schema when possible use google best practices), notes (rich text/markdown), tags (many), createdAt, updatedAt, savedFrom (web|extension)}.
- Tag: { id, ownerId, name }.
- BookmarkTag (join table): { bookmarkId, tagId }
- + users table

# Requirements
- Authentication (users can signup/ login) - supabase auth
- Vite + React for webapp 
- Vanilla JS for extension
- Drizzle ORM with MongoDB (supabase) for database 

## UX
- Bookmark list in /home shows newest bookmarks first
- Simple, modern UI with fast interactions and optimistic UI updates so everything feels instant and snappy.
- * Prefer reusing shared logic (API client, types, utils) across web app and extension instead of duplicating code
- **Important** search and filters must be applied to BACKEND 

# Extension-ready API (lightweight)
- Provide authenticated endpoints to create/ edit/ delete bookmarks
- List/ search bookmarks
- List tags

# Extension
- Simple /extension folder with all bundled files
- Complete, lightweight extension code with:
    * manifest.json
    * service worker/background scripts as needed
    * side panel UI (HTML/CSS/JS or React—your choice)
    * API client module
    * auth module + storage (use the best option to align extension sessions with the app auth so they work together seamlessly)

# Deliverable
Working web app with auth, bookmark CRUD, folders/tags, search + filters, and authenticated API endpoints and simple vanilla.JS browser extension which uses Manifest 3 and sidepanel to persist across tabs as the user browses so there is always an easy way to grab a bookmark, add a tag or leave a note from the browser.
