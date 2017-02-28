# Language Translation



There are two language translation pipe. ln and ek.

* 'ln' uses the language in language-text.ts while 'ek' uses the input of pipe.

* 'ek' is for English or Korean.

````
    {{ 'fourm' | ln }}
    {{ ['Register', '회원가입'] | ek }}
````

* 'ek' gets two parameters. The first string is English, and the second string is Korean.


* You can use it on template expression.

````

<latest-component
    [title] = " ['Discussion', '자유게시판'] | ek "
></latest-component>

````


# 한국어 설명

기본적으로 etc/config.ts 와 etc/language-text.ts 두개가 언어 번역에 대한 기본 정보를 담고 있다.



사용자의 기본 언어는 'en' 아니면 'ko' 이다.

* 먼저, 웹 브라우저에 의해서 결정된다.
    * 웹 브라우저가 'en' 이 아니면, 무조건 'en'

* 그리고 만약, 사용자가 설정의 'setting.language' 에 기록 된 언어가 있으면 그 언어에 따라 번역을 한다.
    * 이것은 app.ts 의 this.app.translate() 함수를 호출하므로서 갈무리 한다.
    