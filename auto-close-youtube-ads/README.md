# NOTICE: The script was broken by YouTube

Clicking the skip button requires a "trusted event" which I am not able to simulate through a
userscript. Sadly, it is the end of an era unless me or someone manages to find a solution.

# [Automatically Close YouTube Ads](https://greasyfork.org/en/scripts/9165-auto-close-youtube-ads)

**This isn't meant to be an ad-blocker (quite the opposite), it is meant to make YouTube ads more bearable while continuing to support the video creators on YouTube.**

This script will automatically press the skip button on YouTube videos ads and click the close button on popup ads.

The script has 3 menu options you can find in the tamper/grease monkey menus when you're on a youtube page.

**The first menu option** lets you choose how many seconds of delay you would like before the script closes the ad. _The default for this option is 3 seconds._

**The second menu option** lets you enable/disable whether you want video ads to be muted while they play. _This option is enabled by default._

**The third menu option** lets you enable/disable whether you want video ads to be hidden while they play. _This option is disabled by default._

I like to support the people who make videos I like on YouTube so I white-list them on my ad-blocker, unfortunately ads are kind of annoying so I made this script to make them a bit more bearable.

# Notes on YouTube Monetization

Here are some things to keep in mind when using this script in regards to supporting YouTubers.

There are a few ways that YouTubers make money when it comes to ads. CPM (Cost per 1000 impressions), CPC (Cost per click) or CPV (Cost per view).

- CPM: With this script installed this monetization method will always be counted since any view of the ad no matter how short will count.
- CPC: If you set a long enough delay for closing ads you should be able to read/watch the ad and click on it before it's closed. If you set a very short delay you won't be able to do this.
- CPV: In this method a view is only considered a view if you watch the ad for either 30 seconds or until it reaches the end, whichever comes first. So if the ad is a skippable one and your ad closing delay is set to less than 30 seconds the view won't be counted; on the other hand if the video isn't skippable the view will always be counted.

<small>[Source](https://support.google.com/adwords/answer/2464960?hl=en)</small>
