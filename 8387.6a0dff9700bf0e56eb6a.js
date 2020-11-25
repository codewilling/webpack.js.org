(self.webpackChunk=self.webpackChunk||[]).push([[8387],{8387:n=>{n.exports='<blockquote> <p>This section describes webpack internals and can be useful for plugin developers</p> </blockquote> <p>The bundling is a function that takes some files and emits others.</p> <p>But between input and output, it also has <a href="/concepts/modules/">modules</a>, <a href="/concepts/entry-points/">entry points</a>, chunks, chunk groups, and many other intermediate parts.</p> <h2 id="the-main-parts">The main parts<a href="#the-main-parts" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a></h2> <p>Every file used in your project is a <a href="/concepts/modules/">Module</a></p> <p><strong>./index.js</strong></p> <pre><code class="hljs language-js"><span class="token keyword">import</span> app <span class="token keyword">from</span> <span class="token string">\'./app.js\'</span><span class="token punctuation">;</span></code></pre> <p><strong>./app.js</strong></p> <pre><code class="hljs language-js"><span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token string">\'the app\'</span><span class="token punctuation">;</span></code></pre> <p>By using each other, the modules form a graph (<code>ModuleGraph</code>).</p> <p>During the bundling process, modules are combined into chunks. Chunks combine into chunk groups and form a graph (<code>ChunkGraph</code>) interconnected through modules. When you describe an entry point - under the hood, you create a chunk group with one chunk.</p> <p><strong>./webpack.config.js</strong></p> <pre><code class="hljs language-js">module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n  entry<span class="token operator">:</span> <span class="token string">\'./index.js\'</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <p>One chunk group with the <code>main</code> name created (<code>main</code> is the default name for an entry point). This chunk group contains <code>./index.js</code> module. As the parser handles imports inside <code>./index.js</code> new modules are added into this chunk.</p> <p>Another example:</p> <p><strong>./webpack.config.js</strong></p> <pre><code class="hljs language-js">module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n  entry<span class="token operator">:</span> <span class="token punctuation">{</span>\n    home<span class="token operator">:</span> <span class="token string">\'./home.js\'</span><span class="token punctuation">,</span>\n    about<span class="token operator">:</span> <span class="token string">\'./about.js\'</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <p>Two chunk groups with names <code>home</code> and <code>about</code> are created. Each of them has a chunk with a module - <code>./home.js</code> for <code>home</code> and <code>./about.js</code> for <code>about</code></p> <blockquote> <p>There might be more than one chunk in a chunk group. For example <a href="/plugins/split-chunks-plugin/">SplitChunksPlugin</a> splits a chunk into one or more chunks.</p> </blockquote> <h2 id="chunks">Chunks<a href="#chunks" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a></h2> <p>Chunks come in two forms:</p> <ul> <li><code>initial</code> is the main chunk for the entry point. This chunk contains all the modules and its dependencies that you specify for an entry point.</li> <li><code>non-initial</code> is a chunk that may be lazy-loaded. It may appear when <a href="/guides/code-splitting/#dynamic-imports">dynamic import</a> or <a href="/plugins/split-chunks-plugin/">SplitChunksPlugin</a> is being used.</li> </ul> <p>Each chunk has a corresponding <strong>asset</strong>. The assets are the output files - the result of bundling.</p> <p><strong>webpack.config.js</strong></p> <pre><code class="hljs language-js">module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>\n  entry<span class="token operator">:</span> <span class="token string">\'./src/index.jsx\'</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre> <p><strong>./src/index.jsx</strong></p> <pre><code class="hljs language-js"><span class="token keyword">import</span> React <span class="token keyword">from</span> <span class="token string">\'react\'</span><span class="token punctuation">;</span>\n<span class="token keyword">import</span> ReactDOM <span class="token keyword">from</span> <span class="token string">\'react-dom\'</span><span class="token punctuation">;</span>\n\n<span class="token keyword">import</span><span class="token punctuation">(</span><span class="token string">\'./app.jsx\'</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token parameter">App</span> <span class="token operator">=></span> ReactDOM<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span><span class="token operator">&#x3C;</span>App <span class="token operator">/</span><span class="token operator">></span><span class="token punctuation">,</span> root<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre> <p>Initial chunk with name <code>main</code> is created. It contains:</p> <ul> <li><code>./src/index.jsx</code></li> <li><code>react</code></li> <li><code>react-dom</code></li> </ul> <p>and all their dependencies, except <code>./app.jsx</code></p> <p>Non-initial chunk for <code>./app.jsx</code> is created as this module is imported dynamically.</p> <p><strong>Output:</strong></p> <ul> <li><code>/dist/main.js</code> - an <code>initial</code> chunk</li> <li><code>/dist/394.js</code> - <code>non-initial</code> chunk</li> </ul> <p>By default, there is no name for <code>non-initial</code> chunks so that a unique ID is used instead of a name. When using dynamic import we may specify a chunk name explicitly by using a <a href="/api/module-methods/#magic-comments">"magic" comment</a>:</p> <pre><code class="hljs language-js"><span class="token keyword">import</span><span class="token punctuation">(</span>\n  <span class="token comment">/* webpackChunkName: "app" */</span>\n  <span class="token string">\'./app.jsx\'</span>\n<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token parameter">App</span> <span class="token operator">=></span> ReactDOM<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span><span class="token operator">&#x3C;</span>App <span class="token operator">/</span><span class="token operator">></span><span class="token punctuation">,</span> root<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre> <p><strong>Output:</strong></p> <ul> <li><code>/dist/main.js</code> - an <code>initial</code> chunk</li> <li><code>/dist/app.js</code> - <code>non-initial</code> chunk</li> </ul> <h2 id="output">Output<a href="#output" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a></h2> <p>The names of the output files are affected by the two fields in the config:</p> <ul> <li><a href="/configuration/output/#outputfilename"><code>output.filename</code></a> - for <code>initial</code> chunk files</li> <li><a href="/configuration/output/#outputchunkfilename"><code>output.chunkFilename</code></a> - for <code>non-initial</code> chunk files</li> <li>In some cases chunks are used <code>initial</code> and <code>non-initial</code>. In those cases <code>output.filename</code> is used.</li> </ul> <p>A <a href="/configuration/output/#template-strings">few placeholders</a> are available in these fields. Most often:</p> <ul> <li><code>[id]</code> - chunk id (e.g. <code>[id].js</code> -> <code>485.js</code>)</li> <li><code>[name]</code> - chunk name (e.g. <code>[name].js</code> -> <code>app.js</code>). If a chunk has no name, then its id will be used</li> <li><code>[contenthash]</code> - md4-hash of the output file content (e.g. <code>[contenthash].js</code> -> <code>4ea6ff1de66c537eb9b2.js</code>)</li> </ul> '}}]);