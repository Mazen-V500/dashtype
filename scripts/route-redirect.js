(function routeRedirect(){
  function isLocal(){
    var host = (window.location.hostname || '').toLowerCase();
    return window.location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  function isGithubPages(){
    var host = (window.location.hostname || '').toLowerCase();
    return host.endsWith('github.io');
  }

  function getGithubBase(){
    var parts = (window.location.pathname || '/').split('/').filter(Boolean);
    if (!parts.length || parts[0].indexOf('.') >= 0) return '/';
    return '/' + parts[0] + '/';
  }

  function toUrl(base, path){
    var b = String(base || '/');
    var p = String(path || '');
    if (!b.endsWith('/')) b += '/';
    if (p.startsWith('/')) p = p.slice(1);
    return b + p;
  }

  var cfg = document.documentElement.dataset || {};
  var routePath = cfg.routePath || '';
  var localPath = cfg.localPath || '';

  if (!routePath) return;

  var target;
  if (isLocal() && localPath) {
    target = localPath;
  } else if (isGithubPages()) {
    target = toUrl(getGithubBase(), routePath);
  } else {
    target = toUrl('/', routePath);
  }

  var tail = (window.location.search || '') + (window.location.hash || '');
  window.location.replace(target + tail);
})();