---
title: "how to use git quickly part 2"
date: "2017-03-02T06:55:59.000Z"
updated: "2024-03-16T15:23:02.007Z"
slug: "小而美-工具/how-to-use-git-quickly-part2"
permalink: "/2017/03/02/小而美-工具/how-to-use-git-quickly-part2/"
categories: ["小而美-工具"]
tags: ["git", "github"]
---
One simple example to push your code to your github account After you’re done with Part 1 , Let’s practice now. Create a new repository in your github Just log into your github account and create a new repository Clone the repository to local After that, you go to the new repository page to copy the SSH or HTTPS url to clone the repository into local Then go back to git bash and type git clone url The repository is in your local destination now. Edit your code on local Like you can add a new python script Push your code to github Add the code into buffering1$ git add . Notice there is a dot in the end of the command. It means add all things into the buffer. And there is a frequently-used command git status. It can check the status of your local repository now. Now commit your buffer1$ git commit -m "first commit" -m means the message you can record here. Now you can push your code into your github now1$ git push origin main And you can see the response message like this That means you push your local code into your github repository. And you can you can check your websit repository right now. Congratulations ! You finished the simple use of git and github. Try to play it to get more fun yourself, good luck!!!
