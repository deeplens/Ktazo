# Ktazo

# For the Gloo Hackathon judges

The best way to view Ktazo is through this link:

https://studio--studio-1890604432-d69b4.us-central1.hosted.app

It was built using Google's Firebase Studio. 
It requires a GEMINI_API_KEY.

Optionally, it takes a YOUTUBE_API_KEY for sermon selection. However, an easier way to verify functionality is to use the sample sermon transcript which I have provided in the file: 1-corinthians-1_1-17-Sermon-Sample.txt

Ktazo has two views, a Pastor/Admin view and a member view. A quick way to get started is to use the Member view first. Here is the login:

Email: member2@ktazo.com
Password: hack2025

It has mock data in there and you can explore all the features. 

To actually load a sermon, log out (the colored sphere in the top right), and log in as:

Email: admin@ktazo.com
Password: hack2025

Here you will see the sermons in various stages of approval. Most of these are mock data. Click Upload Sermon and then Upload Transcript. The full transcript will then be visible. 

Then enter a Speaker's name and select Process Sermon. 

The pastor can select artwork for the sermon, but you can enter text and it will create an image for the members to see, or leave it blank and it will be generated as a nature scene. 

Scroll to the bottom and click "Generate Weekly Content" This creates all the content for members. It takes about 2 minutes. Once generated, you can see the questions but not the games. If you want to explore the games that are generated, switch back to member view (sphere in top right)

Advanced Settings:

If you go back to admin and select Settings on the left menu, you'll see the features which are customizable for the church. Many of these are AI settings which establish the tone and professionalism of the content. This allows for contextualization, since a church in Alabama may have a different tone than one in New England. 

Limits:

This is created in a prototyping environment. Firebase Studio limits the size of data for testing, so loading a catalog of sermons will have to wait until the app is productized and moved to Google Cloud.

Integration with Gloo AI:

The prototyping environment limited use to Gemini models. The intention is to move to Gloo AI for chat completion and other services. 

Integration with Gloo Workspace:

Ktazo will heavily depend on Gloo Workspace for texting, email and group management. 

