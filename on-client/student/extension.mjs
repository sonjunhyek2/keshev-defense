// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.

function formatDeviceStatus(status) {
  if (status === 'compliant') return '보안 기준 충족(compliant)';
  if (status === 'noncompliant') return '보안 기준 미충족(noncompliant)';
  return '확인 불가(unknown)';
}

function formatSessionStatus(status) {
  if (status === 'active') return '활성(active)';
  if (status === 'expired') return '만료(expired)';
  if (status === 'revoked') return '철회됨(revoked)';
  return '확인 불가(unknown)';
}

function formatMode(mode) {
  if (mode === 'demo') return '예제 자료';
  if (mode === 'disconnected') return '연결 없음';
  if (mode === 'unknown') return '확인 불가';
  return '';
}

function renderModeBadge(mode) {
  const text = formatMode(mode);
  if (!text) return null;
  const span = document.createElement('span');
  span.className = mode === 'demo' ? 'tag tag-demo' : 'tag';
  span.textContent = text;
  return span;
}

export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const root = document.createElement('div');
      root.className = 'student-identity';

      // 1. 내 계정 및 기기 상태 (me)
      const meSection = document.createElement('section');
      meSection.className = 'student-section student-me';

      const meTitle = document.createElement('h3');
      meTitle.textContent = '내 계정 및 기기 상태';
      const meBadge = renderModeBadge(me?.mode);
      if (meBadge) {
        meTitle.textContent += ' ';
        meTitle.appendChild(meBadge);
      }
      meSection.appendChild(meTitle);

      const meModeText = formatMode(me?.mode);

      if (me?.status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = meModeText ? `불러오는 중 (${meModeText})` : '불러오는 중';
        meSection.appendChild(p);
      } else if (me?.status === 'error') {
        const p = document.createElement('p');
        p.className = 'student-error';
        const msg = me?.error?.message ? `: ${me.error.message}` : '';
        const modeSuffix = meModeText ? ` (${meModeText})` : '';
        p.textContent = `연결 실패${msg}${modeSuffix}`;
        meSection.appendChild(p);
      } else if (me?.status === 'ok' && me?.data) {
        const user = me.data.user || {};
        const device = me.data.device || {};
        const session = me.data.session || {};

        const dl = document.createElement('dl');
        dl.className = 'kv';

        // 사용자 이름 · ID
        const dtUser = document.createElement('dt');
        dtUser.textContent = '사용자';
        const ddUser = document.createElement('dd');
        const userLabel = user.label || '확인 불가';
        const userId = user.id ? ` (ID: ${user.id})` : '';
        ddUser.textContent = `${userLabel}${userId}`;
        dl.appendChild(dtUser);
        dl.appendChild(ddUser);

        // 기기 이름 · ID · 상태
        const dtDevice = document.createElement('dt');
        dtDevice.textContent = '기기';
        const ddDevice = document.createElement('dd');
        const deviceLabel = device.label || '확인 불가';
        const deviceId = device.id ? ` (ID: ${device.id})` : '';
        const deviceStatus = formatDeviceStatus(device.status);
        ddDevice.textContent = `${deviceLabel}${deviceId} · ${deviceStatus}`;
        if (device.status === 'noncompliant') {
          ddDevice.style.color = '#c5221f';
          ddDevice.style.fontWeight = 'bold';
        }
        dl.appendChild(dtDevice);
        dl.appendChild(ddDevice);

        // 세션 ID · 상태
        const dtSession = document.createElement('dt');
        dtSession.textContent = '세션';
        const ddSession = document.createElement('dd');
        const sessionId = session.id ? `ID: ${session.id}` : '확인 불가';
        const sessionStatus = formatSessionStatus(session.status);
        ddSession.textContent = `${sessionId} · ${sessionStatus}`;
        if (session.status === 'expired' || session.status === 'revoked') {
          ddSession.style.color = '#c5221f';
          ddSession.style.fontWeight = 'bold';
        }
        dl.appendChild(dtSession);
        dl.appendChild(ddSession);

        meSection.appendChild(dl);
      } else {
        const p = document.createElement('p');
        p.textContent = '확인 불가';
        meSection.appendChild(p);
      }
      root.appendChild(meSection);

      // 2. 등록 기기 목록 (devices)
      const devicesSection = document.createElement('section');
      devicesSection.className = 'student-section student-devices';

      const devicesTitle = document.createElement('h3');
      devicesTitle.textContent = '등록 기기 목록';
      const devicesBadge = renderModeBadge(devices?.mode);
      if (devicesBadge) {
        devicesTitle.textContent += ' ';
        devicesTitle.appendChild(devicesBadge);
      }
      devicesSection.appendChild(devicesTitle);

      const devicesModeText = formatMode(devices?.mode);

      if (devices?.status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = devicesModeText ? `불러오는 중 (${devicesModeText})` : '불러오는 중';
        devicesSection.appendChild(p);
      } else if (devices?.status === 'error') {
        const p = document.createElement('p');
        p.className = 'student-error';
        const msg = devices?.error?.message ? `: ${devices.error.message}` : '';
        const modeSuffix = devicesModeText ? ` (${devicesModeText})` : '';
        p.textContent = `연결 실패${msg}${modeSuffix}`;
        devicesSection.appendChild(p);
      } else if (devices?.status === 'ok') {
        const list = Array.isArray(devices?.data) ? devices.data : [];
        if (list.length === 0) {
          const empty = document.createElement('p');
          empty.textContent = '등록된 기기가 없습니다.';
          devicesSection.appendChild(empty);
        } else {
          const ul = document.createElement('ul');
          for (const d of list) {
            const li = document.createElement('li');
            const label = d.label || '기기';
            const idStr = d.id ? ` (ID: ${d.id})` : '';
            li.textContent = `${label}${idStr} · ${formatDeviceStatus(d.status)}`;
            if (d.status === 'noncompliant') {
              li.style.color = '#c5221f';
              li.style.fontWeight = 'bold';
            }
            ul.appendChild(li);
          }
          devicesSection.appendChild(ul);
        }
      } else {
        const p = document.createElement('p');
        p.textContent = '확인 불가';
        devicesSection.appendChild(p);
      }
      root.appendChild(devicesSection);

      // 3. 로그인 세션 목록 (sessions)
      const sessionsSection = document.createElement('section');
      sessionsSection.className = 'student-section student-sessions';

      const sessionsTitle = document.createElement('h3');
      sessionsTitle.textContent = '로그인 세션 목록';
      const sessionsBadge = renderModeBadge(sessions?.mode);
      if (sessionsBadge) {
        sessionsTitle.textContent += ' ';
        sessionsTitle.appendChild(sessionsBadge);
      }
      sessionsSection.appendChild(sessionsTitle);

      const sessionsModeText = formatMode(sessions?.mode);

      if (sessions?.status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = sessionsModeText ? `불러오는 중 (${sessionsModeText})` : '불러오는 중';
        sessionsSection.appendChild(p);
      } else if (sessions?.status === 'error') {
        const p = document.createElement('p');
        p.className = 'student-error';
        const msg = sessions?.error?.message ? `: ${sessions.error.message}` : '';
        const modeSuffix = sessionsModeText ? ` (${sessionsModeText})` : '';
        p.textContent = `연결 실패${msg}${modeSuffix}`;
        sessionsSection.appendChild(p);
      } else if (sessions?.status === 'ok') {
        const list = Array.isArray(sessions?.data) ? sessions.data : [];
        if (list.length === 0) {
          const empty = document.createElement('p');
          empty.textContent = '표시할 세션이 없습니다.';
          sessionsSection.appendChild(empty);
        } else {
          const ul = document.createElement('ul');
          for (const s of list) {
            const li = document.createElement('li');
            const idStr = s.id ? `세션 ID: ${s.id}` : '세션 ID 확인 불가';
            li.textContent = `${idStr} · ${formatSessionStatus(s.status)}`;
            if (s.status === 'expired' || s.status === 'revoked') {
              li.style.color = '#c5221f';
              li.style.fontWeight = 'bold';
            }
            ul.appendChild(li);
          }
          sessionsSection.appendChild(ul);
        }
      } else {
        const p = document.createElement('p');
        p.textContent = '확인 불가';
        sessionsSection.appendChild(p);
      }
      root.appendChild(sessionsSection);

      return root;
    },
    renderDecision({ status, mode, data, error, appId } = {}) {
      const formatDecision = (dec) => {
        if (dec === 'allow') return '접근 허용(allow)';
        if (dec === 'deny') return '접근 거부(deny)';
        if (dec === 'challenge') return '추가 확인 필요(challenge)';
        return '확인 불가(unknown)';
      };

      const root = document.createElement('div');
      root.className = 'student-decision';

      // 1. 요청 전 (idle)
      if (status === 'idle') {
        const p = document.createElement('p');
        p.className = 'student-idle muted';
        p.textContent = '앱을 골라 접속을 요청하세요';
        root.appendChild(p);
        return root;
      }

      // 2. 요청 중 (loading)
      if (status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = '판정 확인 중';
        root.appendChild(p);
        return root;
      }

      // 3. 요청 실패 (error)
      if (status === 'error') {
        const errorBox = document.createElement('div');
        errorBox.className = 'student-error-box';

        const pTitle = document.createElement('p');
        pTitle.className = 'student-error';
        pTitle.style.color = '#c5221f';
        pTitle.style.fontWeight = 'bold';
        const msg = error?.message ? `: ${error.message}` : '';
        pTitle.textContent = `요청 실패${msg}`;
        errorBox.appendChild(pTitle);

        const pNote = document.createElement('p');
        pNote.className = 'student-error-note muted';
        pNote.textContent = '안내: 이것은 접근 거부 판정이 아닙니다. 서버와의 통신에 실패했습니다.';
        errorBox.appendChild(pNote);

        if (appId) {
          const pApp = document.createElement('p');
          pApp.className = 'student-target-app';
          pApp.textContent = `대상 앱 ID: ${appId}`;
          errorBox.appendChild(pApp);
        }

        root.appendChild(errorBox);
        return root;
      }

      // 4. 판정 수신 (ok)
      if (status === 'ok' && data) {
        const decision = data.decision;
        const isAllow = decision === 'allow';
        const isDeny = decision === 'deny';
        const isChallenge = decision === 'challenge';
        const isUnknown = !isAllow && !isDeny && !isChallenge;

        const resultBox = document.createElement('div');
        resultBox.className = 'student-decision-result';

        // 판정 결과 (텍스트 및 색상)
        const pDecision = document.createElement('p');
        pDecision.className = 'student-decision-status';
        pDecision.style.fontSize = '1.1rem';
        pDecision.style.fontWeight = 'bold';
        const decisionText = formatDecision(decision);
        pDecision.textContent = `판정 결과: ${decisionText}`;

        if (isAllow) {
          pDecision.style.color = '#137333';
        } else if (isDeny) {
          pDecision.style.color = '#c5221f';
        } else if (isChallenge) {
          pDecision.style.color = '#b06000';
        } else {
          pDecision.style.color = '#5f6368';
        }
        resultBox.appendChild(pDecision);

        // challenge 안내
        if (isChallenge) {
          const pChallengeNotice = document.createElement('p');
          pChallengeNotice.className = 'student-challenge-notice';
          pChallengeNotice.style.color = '#b06000';
          pChallengeNotice.textContent = '안내: 이 앱이 추가 인증·확인 절차를 대신 수행하지 않습니다.';
          resultBox.appendChild(pChallengeNotice);
        }

        // unknown 안내 (허용으로 보이지 않게)
        if (isUnknown) {
          const pUnknownNotice = document.createElement('p');
          pUnknownNotice.className = 'student-unknown-notice';
          pUnknownNotice.style.color = '#c5221f';
          pUnknownNotice.textContent = '안내: 확인 불가 판정은 접근이 허용된 것이 아닙니다.';
          resultBox.appendChild(pUnknownNotice);
        }

        // 세부 항목 (앱 ID, reason, checkedAt)
        const dl = document.createElement('dl');
        dl.className = 'kv';

        // 업무 앱 ID
        const dtApp = document.createElement('dt');
        dtApp.textContent = '업무 앱 ID';
        const ddApp = document.createElement('dd');
        ddApp.textContent = data.appId || appId || '확인 불가';
        dl.appendChild(dtApp);
        dl.appendChild(ddApp);

        // 판정 이유 (reason)
        const dtReason = document.createElement('dt');
        dtReason.textContent = '판정 이유';
        const ddReason = document.createElement('dd');
        ddReason.textContent = data.reason || '사유 없음';
        dl.appendChild(dtReason);
        dl.appendChild(ddReason);

        // 판정 시각 (checkedAt)
        const dtTime = document.createElement('dt');
        dtTime.textContent = '판정 시각';
        const ddTime = document.createElement('dd');
        ddTime.textContent = data.checkedAt || '확인 불가';
        dl.appendChild(dtTime);
        dl.appendChild(ddTime);

        resultBox.appendChild(dl);
        root.appendChild(resultBox);
        return root;
      }

      // 5. 기타 예외 상황
      const pFallback = document.createElement('p');
      pFallback.className = 'student-fallback';
      pFallback.textContent = '확인 불가(unknown): 판정 상태를 확인할 수 없습니다.';
      root.appendChild(pFallback);
      return root;
    },
    renderEvents({ status, mode, data, error } = {}) {
      const root = document.createElement('div');
      root.className = 'student-events-container';

      // 1. loading 상태
      if (status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = '불러오는 중';
        root.appendChild(p);
        return root;
      }

      // 2. error 및 CONTRACT_MISMATCH 상태
      if (status === 'error') {
        const p = document.createElement('p');
        p.className = 'student-error';
        p.style.color = '#c5221f';
        if (error?.code === 'CONTRACT_MISMATCH' || error?.code === 'ENGINE_RESULT_UNVERIFIED') {
          p.textContent = `확인 불가: ${error?.message || '서버 응답 형식을 확인할 수 없습니다.'}`;
        } else {
          p.textContent = `기록을 불러오지 못했습니다: ${error?.message || '오류가 발생했습니다.'}`;
        }
        root.appendChild(p);
        return root;
      }

      // 3. ok 상태이나 원래 데이터가 빈 배열인 경우
      const rawEvents = Array.isArray(data) ? data : [];
      if (rawEvents.length === 0) {
        const p = document.createElement('p');
        p.className = 'student-empty';
        p.textContent = '표시할 기록이 없습니다.';
        root.appendChild(p);
        return root;
      }

      // 4. data 배열을 복사하여 at 기준 최신순(내림차순)으로 정렬 (원본 불변)
      const sortedEvents = [...rawEvents].sort((a, b) => {
        const timeA = a.at ? new Date(a.at).getTime() : 0;
        const timeB = b.at ? new Date(b.at).getTime() : 0;
        return timeB - timeA;
      });

      // 내부 필터 및 상세 선택 상태
      let currentKindFilter = 'all';
      let currentAppFilter = 'all';
      let currentAccessFilter = 'all';
      let selectedEventId = null;

      // 필터 옵션값 추출 (원본 값 기반)
      const kinds = Array.from(new Set(sortedEvents.map(e => e.kind).filter(Boolean)));
      const appIds = Array.from(new Set(sortedEvents.map(e => e.appId).filter(Boolean)));
      const accessStates = Array.from(new Set(sortedEvents.map(e => e.state?.access).filter(Boolean)));

      // 포맷 헬퍼 함수
      const formatKind = (k) => (k === 'access' ? '접속(access)' : k === 'xdr' ? 'XDR 경보(xdr)' : k || '알 수 없음');
      const formatAccess = (acc) => {
        if (acc === 'allowed') return '허용됨(allowed)';
        if (acc === 'denied') return '거부됨(denied)';
        if (acc === 'unknown') return '확인 불가(unknown)';
        return `${acc || '확인 불가'}(${acc || 'unknown'})`;
      };
      const formatSession = (sess) => {
        if (sess === 'active') return '활성(active)';
        if (sess === 'expired') return '만료(expired)';
        if (sess === 'revoked') return '철회됨(revoked)';
        if (sess === 'unknown') return '확인 불가(unknown)';
        return `${sess || '확인 불가'}(${sess || 'unknown'})`;
      };
      const formatDevice = (dev) => {
        if (dev === 'compliant') return '보안 기준 충족(compliant)';
        if (dev === 'noncompliant') return '보안 기준 미충족(noncompliant)';
        if (dev === 'unknown') return '확인 불가(unknown)';
        return `${dev || '확인 불가'}(${dev || 'unknown'})`;
      };

      // 필터 컨트롤 영역
      const filterSection = document.createElement('div');
      filterSection.className = 'student-filter-section';
      filterSection.style.display = 'flex';
      filterSection.style.gap = '12px';
      filterSection.style.flexWrap = 'wrap';
      filterSection.style.marginBottom = '12px';

      // 1) 기록 종류 필터
      const kindLabel = document.createElement('label');
      kindLabel.textContent = '기록 종류: ';
      const kindSelect = document.createElement('select');
      kindSelect.setAttribute('aria-label', '기록 종류');
      const kindAllOpt = document.createElement('option');
      kindAllOpt.value = 'all';
      kindAllOpt.textContent = '전체';
      kindSelect.appendChild(kindAllOpt);
      for (const k of kinds) {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = formatKind(k);
        kindSelect.appendChild(opt);
      }
      kindLabel.appendChild(kindSelect);
      filterSection.appendChild(kindLabel);

      // 2) 업무 앱 필터
      const appLabel = document.createElement('label');
      appLabel.textContent = '업무 앱: ';
      const appSelect = document.createElement('select');
      appSelect.setAttribute('aria-label', '업무 앱');
      const appAllOpt = document.createElement('option');
      appAllOpt.value = 'all';
      appAllOpt.textContent = '전체';
      appSelect.appendChild(appAllOpt);
      for (const a of appIds) {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        appSelect.appendChild(opt);
      }
      appLabel.appendChild(appSelect);
      filterSection.appendChild(appLabel);

      // 3) 접속 상태 필터
      const accessLabel = document.createElement('label');
      accessLabel.textContent = '접속 상태: ';
      const accessSelect = document.createElement('select');
      accessSelect.setAttribute('aria-label', '접속 상태');
      const accessAllOpt = document.createElement('option');
      accessAllOpt.value = 'all';
      accessAllOpt.textContent = '전체';
      accessSelect.appendChild(accessAllOpt);
      for (const ac of accessStates) {
        const opt = document.createElement('option');
        opt.value = ac;
        opt.textContent = formatAccess(ac);
        accessSelect.appendChild(opt);
      }
      accessLabel.appendChild(accessSelect);
      filterSection.appendChild(accessLabel);

      root.appendChild(filterSection);

      // 건수 표시 단락
      const countP = document.createElement('p');
      countP.className = 'student-event-count muted';
      root.appendChild(countP);

      // 목록 컨테이너
      const listContainer = document.createElement('div');
      listContainer.className = 'student-event-list';
      root.appendChild(listContainer);

      // 상세 영역 컨테이너
      const detailContainer = document.createElement('div');
      detailContainer.className = 'student-event-detail-slot';
      root.appendChild(detailContainer);

      // 상세 화면 렌더링
      const renderDetail = () => {
        while (detailContainer.firstChild) detailContainer.removeChild(detailContainer.firstChild);
        if (!selectedEventId) return;

        const event = sortedEvents.find(e => e.id === selectedEventId);
        if (!event) return;

        const box = document.createElement('section');
        box.className = 'card student-detail-box';
        box.setAttribute('data-student-event-detail', event.id);
        box.style.marginTop = '16px';
        box.style.padding = '12px';
        box.style.border = '1px solid #ddd';
        box.style.borderRadius = '8px';

        const title = document.createElement('h3');
        title.textContent = `사건 상세: ${event.id}`;
        box.appendChild(title);

        const dl = document.createElement('dl');
        dl.className = 'kv';

        // 사건 ID
        const dtId = document.createElement('dt');
        dtId.textContent = '사건 ID';
        const ddId = document.createElement('dd');
        ddId.textContent = event.id;
        dl.appendChild(dtId);
        dl.appendChild(ddId);

        // 업무 앱
        const dtApp = document.createElement('dt');
        dtApp.textContent = '업무 앱';
        const ddApp = document.createElement('dd');
        ddApp.textContent = event.appId ? event.appId : '앱 확인 불가';
        dl.appendChild(dtApp);
        dl.appendChild(ddApp);

        // 발생 시각
        const dtTime = document.createElement('dt');
        dtTime.textContent = '발생 시각';
        const ddTime = document.createElement('dd');
        ddTime.textContent = event.at || '확인 불가';
        dl.appendChild(dtTime);
        dl.appendChild(ddTime);

        // 요약
        const dtSummary = document.createElement('dt');
        dtSummary.textContent = '요약';
        const ddSummary = document.createElement('dd');
        ddSummary.textContent = event.summary || '요약 없음';
        dl.appendChild(dtSummary);
        dl.appendChild(ddSummary);

        box.appendChild(dl);

        // 근거 (evidence)
        const evTitle = document.createElement('h4');
        evTitle.textContent = '근거 (evidence)';
        box.appendChild(evTitle);
        const evList = Array.isArray(event.evidence) ? event.evidence : [];
        if (evList.length === 0) {
          const p = document.createElement('p');
          p.className = 'muted';
          p.textContent = '근거 정보가 없습니다.';
          box.appendChild(p);
        } else {
          const ul = document.createElement('ul');
          for (const ev of evList) {
            const li = document.createElement('li');
            li.textContent = `[${ev.id || '근거'}] ${ev.text || ''}`;
            ul.appendChild(li);
          }
          box.appendChild(ul);
        }

        // 규칙 (rules)
        const rulesTitle = document.createElement('h4');
        rulesTitle.textContent = '규칙 (rules)';
        box.appendChild(rulesTitle);
        const rulesList = Array.isArray(event.rules) ? event.rules : [];
        if (rulesList.length === 0) {
          const p = document.createElement('p');
          p.className = 'muted';
          p.textContent = '적용 규칙 정보가 없습니다.';
          box.appendChild(p);
        } else {
          const ul = document.createElement('ul');
          for (const r of rulesList) {
            const li = document.createElement('li');
            li.textContent = `[${r.id || '규칙'}] ${r.text || ''}`;
            ul.appendChild(li);
          }
          box.appendChild(ul);
        }

        // 보안 상태 (state: access, session, device)
        const stateTitle = document.createElement('h4');
        stateTitle.textContent = '보안 상태 (state)';
        box.appendChild(stateTitle);

        const stateDl = document.createElement('dl');
        stateDl.className = 'kv';

        const dtAcc = document.createElement('dt');
        dtAcc.textContent = '접속 상태';
        const ddAcc = document.createElement('dd');
        ddAcc.textContent = formatAccess(event.state?.access);
        stateDl.appendChild(dtAcc);
        stateDl.appendChild(ddAcc);

        const dtSess = document.createElement('dt');
        dtSess.textContent = '세션 상태';
        const ddSess = document.createElement('dd');
        ddSess.textContent = formatSession(event.state?.session);
        stateDl.appendChild(dtSess);
        stateDl.appendChild(ddSess);

        const dtDev = document.createElement('dt');
        dtDev.textContent = '기기 상태';
        const ddDev = document.createElement('dd');
        ddDev.textContent = formatDevice(event.state?.device);
        stateDl.appendChild(dtDev);
        stateDl.appendChild(ddDev);

        box.appendChild(stateDl);

        // XDR 설명 안내
        const xdrNotice = document.createElement('p');
        xdrNotice.className = 'muted';
        xdrNotice.textContent = '안내: XDR 경보는 서버에 이미 저장된 경보를 표시합니다. 화면을 열 때 새로 탐지하지 않습니다.';
        box.appendChild(xdrNotice);

        // 15단계: 실제 조치 버튼은 일절 생성하지 않음 (16단계에서 미지원 안내 버튼 도입 예정)

        detailContainer.appendChild(box);
      };

      // 목록 렌더링
      const renderList = () => {
        while (listContainer.firstChild) listContainer.removeChild(listContainer.firstChild);

        // 로컬 필터링 수행
        const filtered = sortedEvents.filter(e => {
          if (currentKindFilter !== 'all' && e.kind !== currentKindFilter) return false;
          if (currentAppFilter !== 'all' && e.appId !== currentAppFilter) return false;
          if (currentAccessFilter !== 'all' && e.state?.access !== currentAccessFilter) return false;
          return true;
        });

        // 표시 건수와 실제 행 수 동기화
        countP.textContent = `표시 건수: ${filtered.length}건 (전체 ${sortedEvents.length}건)`;

        // 필터링 결과가 0건인 경우 안내 (원래 빈 배열과 구분)
        if (filtered.length === 0) {
          const emptyMsg = document.createElement('p');
          emptyMsg.className = 'student-empty';
          emptyMsg.textContent = '조건에 맞는 기록이 없습니다.';
          listContainer.appendChild(emptyMsg);
          return;
        }

        const ul = document.createElement('ul');
        ul.className = 'student-events-list';
        ul.style.listStyle = 'none';
        ul.style.padding = '0';

        for (const ev of filtered) {
          const li = document.createElement('li');
          li.setAttribute('data-student-event-id', ev.id);
          li.className = 'student-event-item';
          li.style.borderBottom = '1px solid #eee';
          li.style.padding = '10px 0';

          const headerDiv = document.createElement('div');
          headerDiv.style.display = 'flex';
          headerDiv.style.justifyContent = 'space-between';
          headerDiv.style.alignItems = 'center';

          const infoSpan = document.createElement('span');
          const appStr = ev.appId ? ev.appId : '앱 확인 불가';
          infoSpan.textContent = `[${ev.id}] ${formatKind(ev.kind)} · 앱: ${appStr} · 시각: ${ev.at}`;
          headerDiv.appendChild(infoSpan);

          const detailBtn = document.createElement('button');
          detailBtn.type = 'button';
          detailBtn.className = 'btn btn-sm';
          detailBtn.setAttribute('aria-label', `${ev.id} 상세`);
          detailBtn.textContent = `${ev.id} 상세`;
          detailBtn.onclick = () => {
            selectedEventId = (selectedEventId === ev.id) ? null : ev.id;
            renderDetail();
          };
          headerDiv.appendChild(detailBtn);

          li.appendChild(headerDiv);

          const summaryP = document.createElement('p');
          summaryP.style.margin = '4px 0 0';
          summaryP.textContent = ev.summary || '요약 없음';
          li.appendChild(summaryP);

          ul.appendChild(li);
        }

        listContainer.appendChild(ul);
      };

      // 필터 이벤트 바인딩
      kindSelect.addEventListener('change', () => {
        currentKindFilter = kindSelect.value;
        renderList();
      });
      appSelect.addEventListener('change', () => {
        currentAppFilter = appSelect.value;
        renderList();
      });
      accessSelect.addEventListener('change', () => {
        currentAccessFilter = accessSelect.value;
        renderList();
      });

      // 초기 렌더링
      renderList();
      renderDetail();

      return root;
    },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
