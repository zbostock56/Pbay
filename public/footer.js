//   ===========  footer.js =============
//   DESC:
//   Gets the id of the mailto element
//   and makes it link to a premade email
//   template
//   PARAMETERS:
//   None
//   RETURNS:
//   mailto link
//   ===========================

document.getElementById("mail2").href = `mailto:pbayhelp@gmail.com?subject=Bug%20Report&body=What%20bug%20did%20you%20find
%3F%0D%0ALet%20us%20know%20here%3A
%0D%0A
%0D%0A
%0D%0A
%2A%2A%2A%2A%2ADevice%20Information%2A%2A%2A%2A%2A
%0D%0A
Cookies%20Enabled%3A%0D%0A
${navigator.cookieEnabled}
%0D%0A
Device%20Memory%3A%0D%0A
${navigator.deviceMemory}
%0D%0A
Cores%3A%0D%0A
${navigator.hardwareConcurrency}
%0D%0A
Language%3A%0D%0A
${navigator.language}
%0D%0A
Network%20Connection%3A%0D%0A
${navigator.onLine}
%0D%0A
%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A
%0D%0A
%0D%0A
Thanks%2C%0D%0AHappy%20Customer`;
