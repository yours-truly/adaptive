## adaptive

Simple adaptive image server based on [smartcrop.js](https://github.com/jwagner/smartcrop.js)

![Example](https://camo.githubusercontent.com/1086f55f4396e6c34f076b8f4a43c083fc5253d1/687474703a2f2f3239612e63682f73616e64626f782f323031342f736d61727463726f702f6578616d706c652e6a7067)
_Image: [https://www.flickr.com/photos/endogamia/5682480447/](https://www.flickr.com/photos/endogamia/5682480447) by N. Feans_

## Usage

Adaptive exposes a single function that creates an [Express](expressjs.com) app:
```js
var adaptive = require('adaptive');

var opts = {
  secret: 'mysecret',
  cache: '/tmp/adaptive'
};

adaptive(opts).listen(3000);
```

The generated images will be stored in the filesystem. If you don't specify a
`cache` directory, adaptive will store the files in the system's [temp
directory](http://nodejs.org/api/os.html#os_os_tmpdir).

## REST API

You can request images using the following URL pattern:

`http://localhost:3000/<auth-key>/<width>x<height>/<src-url>`


The following URL will generate a 200x200 crop from the example image shown above:
[http://localhost:3000/unsafe/200x200/https://farm6.staticflickr.com/5189/…](http://localhost:3000/unsafe/200x200/https://farm6.staticflickr.com/5189/5682480447_2b7f74b4bd_b.jpg)

### Compression Settings

You can parametrize the JPEG compression by adding `:<quality>` where _quality_
is a value from 0 to 100, optionally followed by a `p` to create a progressive
JPEG.

Examples:

* `http://localhost:3000/unsafe/200x200:75/<src-url>` 75% quality
* `http://localhost:3000/unsafe/200x200:p/<src-url>` progressive, default quality
* `http://localhost:3000/unsafe/200x200:75p/<src-url>` 75% quality, progressive


## Security

In order to prevent DoS attacks _adaptive_ allows you to specify shared secret
that is used to generate a [hash-based message authentication code](
http://en.wikipedia.org/wiki/Hash-based_message_authentication_code).

The web server that serves a page which contains adaptive images generates an
_auth key_ for the _options_ and _src-url_.

When end-users access the page and thus load the image, adaptive generates
a key using the same algorithm. If both auth keys match, the request is
processed.

### Generating auth-keys

Adaptive uses standard HMAC with SHA1 signing.

In order to convert `http://example.com/unsafe/200x200/path/to/image.jpg`
into a _safe_ URL we must sign the part `200x200/path/to/image.jpg`

1. Generate a signature of that part using HMAC-SHA1 with the _secret_.
2. Encode the signature as base64.
3. Replace `+` by `-`
4. Replace `/` by `_`
5. Replace `unsafe` at the beginning of the URL with the generated key

## CLI

Adaptive also comes with a binary that can be used to start a HTTP server:

`adaptive -p <port> -s <secret> -c <cache-dir>`

Alternatively the options can be set using environment variables:

`PORT=3000 SECRET=mysecret npm start`

## Deploying to Heroku/dokku

The easiest way to deploy _adaptive_ to Heroku or a dokku instance is to create
an empty project with nothing but a `package.json`:
```json
{
  "name": "my-adaptive-images",
  "private": true,
  "version": "0.0.1",
  "dependencies": { "adaptive": "*" },
  "scripts": { "start": "adaptive" }
}
```

### Prerequisites

Adpative uses [node-canvas](https://github.com/Automattic/node-canvas) which in
turn is based on Cairo. For system-specific installation instructions please
refer to the [wiki](https://github.com/Automattic/node-canvas/wiki/).

Dokku's Ubuntu image provides all required dependencies except for `libgif`.
The easiest way to add it is to do this:
```
echo https://github.com/fgnass/buildpack-install > .buildpacks
echo https://github.com/heroku/heroku-buildpack-nodejs >> .buildpacks
echo apt-get install -y libgif-dev > .install

git add .buildpacks .install
git commit -m "add node-canvas prerequisites"
```

### Logging

You can turn on [debug](https://www.npmjs.org/package/debug) output by setting
the `DEBUG` env var to `adaptive:*`

## The MIT License (MIT)

Copyright (c) 2014 Felix Gnass

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
