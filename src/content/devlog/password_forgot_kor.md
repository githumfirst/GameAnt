---
title: "윈도우즈 비밀번호 분실시 조치방법"
writer: "NolGaeMi"
date: "2026-03-23"
---

## 비번 잃어버렸을때 걱정 할 필요 없습니다.

CMD창에서 몇단계를 거치면 간단하게 해결 됩니다.

1단계: 윈도우즈 우측 하단의 reboot(재시작)을 Shift키를 누른 상태에서 클릭합니다.

2단계: 안전모드에서 "Trouble Shooting(문제 해결)"을 클릭합니다.

3단계: "Advanced options(고급옵션)"을 클릭합니다.

4단계: "Command Prompt(명령 프롬프트)"를 클릭합니다.

5단계: 아래 내용을 입력하고 엔터를 칩니다.

```
copy c:\windows\system32\utilman.exe c:\windows\system32\utilman.bak

copy c:\windows\system32\cmd.exe c:\windows\system32\utilman.exe
```
6단계 overwrite, type Yes or No(덮어쓰기, Yes 선택)

7단계: 재부팅후 로그인 화면에서 우측 하단의 유틸리티 아이콘을 클릭하면 CMD창이 뜹니다.

8단계: 아래와 같이 암호를 재입력 합니다.

```
net user nolgaemi  1234
```
위에서 nolgaemi는 사용자 이름, 1234는 새로운 비밀번호 입니다.

9단계: cmd를 X를 클릭해서 끄고, 새로운 비번을 입력하면 로그인이 됩니다. 또는 재부팅후 새로운 비밀번호로 로그인 합니다.

이렇게 해서 윈도우즈 비밀번호를 잃어버렸을때 새로운 비번을 설정할 수 있습니다.

## 그런데 이게 무슨 원리 일까요?

shifter +  reboot로 재시작한것은 utilman.exe를 실행한 것입니다. 제한적인 기능밖에 못해요.그런데, 여기서, cmd.exe를 utilman.exe로 교체하면, 이제 utilman.exe는 admin이 된거에요.**엄청난 보안 구멍**이 발생한거에요. 복구하라고 만들어놓은 파이프라인에 엄청난 보안 이슈가 생긴거죠. 이걸 알고, MS에서는 bitlocker를 내놓았어요. 

```
net user nolgaemi  1234
```

위에서 nolgaemi는 사용자 이름, 1234는 새로운 비밀번호 입니다.

위와 같이 변경은 복구모드가 아니라, cmd.exe를 실행한 것입니다. 그래서, MS에서는 bitlocker를 내놓은거에요. 하지만, bitlocker도 뚫을 방법이 있습니다. 지금 windows 11으로 강제 업그레이드를 할때에도 tmp을 우회하는 방법을 사용하거든요. 역시 **편의성과 보안**은 반비례 하죠. 그러니까, 윈도우즈 노트북을 누가 훔쳐가면, 암호가 걸려있어도, 거의 뚫을수 있죠. 실물을 빼기지 않는게 가장 중요합니다. 



**오늘도 좋은거 배웠어요! 하루 하루가 배움의 연속입니다!**


Contact Us: WeListenToCustomer@gmail.com
