---
"azdo-npm-auth": patch
---

It's not obvious we are publishing with [trusted publishing](https://docs.npmjs.com/trusted-publishers) - this release removes the npm token; this way if we succeed in publishing it must mean we are using trusted publishing. 

I'm not certain if changesets is calling `npm publish` under the bonnet, this should hopefully determine if it is.
