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

        // 16단계: supportedActions가 비어있지 않을 때만 '<action> 미지원' 비활성 버튼 표시
        if (Array.isArray(event.supportedActions) && event.supportedActions.length > 0) {
          const actionsDiv = document.createElement('div');
          actionsDiv.className = 'student-supported-actions';
          actionsDiv.style.marginTop = '12px';
          for (const act of event.supportedActions) {
            const actBtn = document.createElement('button');
            actBtn.type = 'button';
            actBtn.disabled = true;
            actBtn.setAttribute('aria-label', `${act} 미지원`);
            actBtn.textContent = `${act} 미지원`;
            actionsDiv.appendChild(actBtn);
          }
          const actNotice = document.createElement('p');
          actNotice.className = 'muted';
          actNotice.textContent = '조치 실행 연결은 준비 중입니다.';
          actionsDiv.appendChild(actNotice);
          box.appendChild(actionsDiv);
        }

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
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      const root = document.createElement('div');
      root.className = 'student-status-container';

      const isTimeout = (err) => Boolean(
        err?.code && (err.code === 'TIMEOUT' || err.code.includes('TIMEOUT')) ||
        (err?.message && err.message.includes('시간 초과'))
      );

      // 1. 등록 기기 상태 (devices)
      const devicesSection = document.createElement('section');
      devicesSection.className = 'student-status-section';
      const devicesTitle = document.createElement('h3');
      devicesTitle.textContent = '기기 점검 상태';
      devicesSection.appendChild(devicesTitle);

      if (devices?.status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = '기기 정보 불러오는 중';
        devicesSection.appendChild(p);
      } else if (devices?.status === 'error') {
        const pErr = document.createElement('p');
        pErr.className = 'student-error';
        pErr.style.color = '#c5221f';
        const prefix = isTimeout(devices.error) ? '기기 정보 조회 시간 초과: ' : '기기 정보 불러오기 실패: ';
        pErr.textContent = `${prefix}${devices.error?.message || '오류가 발생했습니다.'}`;
        devicesSection.appendChild(pErr);

        const pRetry = document.createElement('p');
        pRetry.className = 'student-retry-note muted';
        pRetry.textContent = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.';
        devicesSection.appendChild(pRetry);
      } else if (devices?.status === 'ok') {
        const list = Array.isArray(devices.data) ? devices.data : [];
        if (list.length === 0) {
          const p = document.createElement('p');
          p.className = 'student-empty';
          p.textContent = '등록된 기기가 없습니다.';
          devicesSection.appendChild(p);
        } else {
          const ul = document.createElement('ul');
          for (const d of list) {
            const li = document.createElement('li');
            li.textContent = `${d.label || d.id || '기기'}: ${formatDeviceStatus(d.status)}`;
            if (d.status !== 'compliant') li.style.color = '#c5221f';
            ul.appendChild(li);
          }
          devicesSection.appendChild(ul);
        }
      } else {
        const p = document.createElement('p');
        p.textContent = '기기 상태 확인 불가';
        devicesSection.appendChild(p);
      }
      root.appendChild(devicesSection);

      // 2. 현재 세션 상태 (sessions)
      const sessionsSection = document.createElement('section');
      sessionsSection.className = 'student-status-section';
      const sessionsTitle = document.createElement('h3');
      sessionsTitle.textContent = '현재 연결 세션 상태';
      sessionsSection.appendChild(sessionsTitle);

      const sessionNotice = document.createElement('p');
      sessionNotice.className = 'muted';
      sessionNotice.textContent = '세션은 현재 검증된 연결 하나를 조회합니다.';
      sessionsSection.appendChild(sessionNotice);

      if (sessions?.status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = '세션 정보 불러오는 중';
        sessionsSection.appendChild(p);
      } else if (sessions?.status === 'error') {
        const pErr = document.createElement('p');
        pErr.className = 'student-error';
        pErr.style.color = '#c5221f';
        const prefix = isTimeout(sessions.error) ? '세션 정보 조회 시간 초과: ' : '세션 정보 불러오기 실패: ';
        pErr.textContent = `${prefix}${sessions.error?.message || '오류가 발생했습니다.'}`;
        sessionsSection.appendChild(pErr);

        const pRetry = document.createElement('p');
        pRetry.className = 'student-retry-note muted';
        pRetry.textContent = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.';
        sessionsSection.appendChild(pRetry);
      } else if (sessions?.status === 'ok') {
        const list = Array.isArray(sessions.data) ? sessions.data : [];
        if (list.length === 0) {
          const p = document.createElement('p');
          p.className = 'student-empty';
          p.textContent = '현재 연결이 없습니다.';
          sessionsSection.appendChild(p);
        } else {
          const ul = document.createElement('ul');
          for (const s of list) {
            const li = document.createElement('li');
            li.textContent = `세션 ID ${s.id || '알 수 없음'}: ${formatSessionStatus(s.status)}`;
            if (s.status !== 'active') li.style.color = '#c5221f';
            ul.appendChild(li);
          }
          sessionsSection.appendChild(ul);
        }
      } else {
        const p = document.createElement('p');
        p.textContent = '세션 상태 확인 불가';
        sessionsSection.appendChild(p);
      }
      root.appendChild(sessionsSection);

      // 3. 주의 알림 목록 (notifications)
      const notiSection = document.createElement('section');
      notiSection.className = 'student-status-section';
      const notiTitle = document.createElement('h3');
      notiTitle.textContent = '주의 알림';
      notiSection.appendChild(notiTitle);

      const notiList = Array.isArray(notifications) ? notifications : [];
      if (notiList.length === 0) {
        const p = document.createElement('p');
        p.className = 'student-empty';
        p.textContent = '주의할 알림이 없습니다.';
        notiSection.appendChild(p);
      } else {
        const ul = document.createElement('ul');
        for (const n of notiList) {
          const li = document.createElement('li');
          li.textContent = `[${n.resource || '알림'}] (코드: ${n.code || 'UNKNOWN'}) ${n.message || ''}`;
          ul.appendChild(li);
        }
        notiSection.appendChild(ul);
      }
      root.appendChild(notiSection);

      // 4. 진단 정보 및 복사 (diagnostics)
      const diagSection = document.createElement('section');
      diagSection.className = 'student-status-section';
      const diagTitle = document.createElement('h3');
      diagTitle.textContent = '시스템 진단 정보';
      diagSection.appendChild(diagTitle);

      const diagHelpP = document.createElement('p');
      diagHelpP.className = 'muted';
      diagHelpP.textContent = '도움 요청에 사용할 진단 정보입니다. 비밀번호나 인증 토큰은 포함되지 않습니다.';
      diagSection.appendChild(diagHelpP);

      if (diagnostics?.status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = '진단 정보 불러오는 중';
        diagSection.appendChild(p);
      } else if (diagnostics?.status === 'error') {
        const pErr = document.createElement('p');
        pErr.className = 'student-error';
        pErr.style.color = '#c5221f';
        const prefix = isTimeout(diagnostics.error) ? '진단 정보 조회 시간 초과: ' : '진단 정보 불러오기 실패: ';
        pErr.textContent = `${prefix}${diagnostics.error?.message || '오류가 발생했습니다.'}`;
        diagSection.appendChild(pErr);

        const pRetry = document.createElement('p');
        pRetry.className = 'student-retry-note muted';
        pRetry.textContent = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.';
        diagSection.appendChild(pRetry);
      } else if (diagnostics?.status === 'ok' && diagnostics?.data) {
        // 허용된 6개 필드만 명시적으로 추출
        const safeData = {
          requestId: diagnostics.data.requestId || '확인 불가',
          component: diagnostics.data.component || '확인 불가',
          version: diagnostics.data.version || '확인 불가',
          checkedAt: diagnostics.data.checkedAt || '확인 불가',
          'engine.mode': diagnostics.data.engine?.mode || '확인 불가',
          'engine.code': diagnostics.data.engine?.code || '확인 불가'
        };

        const dl = document.createElement('dl');
        dl.className = 'kv';

        const fields = [
          ['요청 ID (requestId)', safeData.requestId],
          ['컴포넌트 (component)', safeData.component],
          ['버전 (version)', safeData.version],
          ['확인 시각 (checkedAt)', safeData.checkedAt],
          ['엔진 모드 (engine.mode)', safeData['engine.mode']],
          ['엔진 코드 (engine.code)', safeData['engine.code']]
        ];

        for (const [label, val] of fields) {
          const dt = document.createElement('dt');
          dt.textContent = label;
          const dd = document.createElement('dd');
          dd.textContent = val;
          dl.appendChild(dt);
          dl.appendChild(dd);
        }
        diagSection.appendChild(dl);

        // 복사 버튼 및 안내
        const copyWrapper = document.createElement('div');
        copyWrapper.style.marginTop = '10px';

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn btn-secondary';
        copyBtn.setAttribute('aria-label', '도움정보 복사');
        copyBtn.textContent = '도움정보 복사';

        const copyStatus = document.createElement('span');
        copyStatus.style.marginLeft = '8px';
        copyStatus.className = 'muted';

        copyBtn.onclick = async () => {
          const copyText = JSON.stringify(safeData, null, 2);
          try {
            if (navigator?.clipboard?.writeText) {
              await navigator.clipboard.writeText(copyText);
              copyStatus.textContent = '복사되었습니다.';
              copyStatus.style.color = '#137333';
            } else {
              copyStatus.textContent = '클립보드 복사를 지원하지 않는 환경입니다.';
              copyStatus.style.color = '#c5221f';
            }
          } catch (e) {
            copyStatus.textContent = '복사에 실패했습니다.';
            copyStatus.style.color = '#c5221f';
          }
        };

        copyWrapper.appendChild(copyBtn);
        copyWrapper.appendChild(copyStatus);
        diagSection.appendChild(copyWrapper);
      } else {
        const p = document.createElement('p');
        p.className = 'student-empty';
        p.textContent = '진단 정보가 아직 조회되지 않았습니다.';
        diagSection.appendChild(p);
      }
      root.appendChild(diagSection);

      return root;
    },
    renderAiConnection({ status, mode, data, error, checkedAt, explanationAccepted } = {}) {
      const root = document.createElement('div');
      root.className = 'student-ai-connection-container';

      const title = document.createElement('h3');
      title.textContent = 'AI 연결 점검 상태';
      root.appendChild(title);

      const getAiErrorGuide = (code) => {
        if (!code) return '담당자에게 계정 연결과 앱 권한 확인 요청';
        if (code === 'ON_AI_PROVISIONING_PENDING' || code === 'MODEL_NOT_CONFIGURED') {
          return '권한 준비 중 또는 설정 미비: 담당자에게 계정 연결과 앱 권한 확인 요청';
        }
        if (code === 'WB_CLCO_AUTH_REQUIRED' || code === 'WB_CLCO_ACCESS_BLOCKED' || code === 'ON_AI_AUTHORIZATION_CHANGED' || code === 'SUBJECT_SCOPE_UNVERIFIED') {
          return '인증 실패 또는 접근 제한: 계정 연결을 다시 확인하고 담당자에게 확인 요청';
        }
        if (code === 'WB_CLCO_COHORT_BUDGET_EXHAUSTED' || code === 'WB_CLCO_LIMIT_REACHED') {
          return '반 사용량 또는 이용 한도: 담당자에게 한도 확인 요청';
        }
        if (code === 'WB_CLCO_SESSION_CLOSED') {
          return '이용 시간 아님: 현재 AI 이용 시간이 아닙니다. 이용 시간 확인';
        }
        if (code === 'WB_CLCO_RATE_LIMITED' || code === 'WB_CLCO_TIMEOUT' || code === 'REQUEST_TIMEOUT' || code === 'ENGINE_TIMEOUT' || code === 'TIMEOUT' || code === 'NETWORK_ERROR') {
          return '요청 제한, 시간 초과 또는 네트워크: 잠시 뒤 직접 다시 점검';
        }
        if (code === 'CANCELLED' || code === 'WB_CLCO_CANCELLED' || code === 'REQUEST_CANCELLED') {
          return '취소됨: AI 점검이 취소되었습니다. 이전 결과는 현재 결과가 아닙니다.';
        }
        if (code === 'ON_AI_MODEL_LIST_EMPTY') {
          return '쓸 수 있는 모델 없음: 담당자에게 모델 허용 설정 확인 요청';
        }
        return '점검 상태 확인 불가: 담당자에게 확인 요청';
      };

      if (status === 'idle') {
        const p = document.createElement('p');
        p.className = 'student-idle';
        p.textContent = 'AI 연결 점검 전입니다. 설정값 존재는 이용 권한 확인이 아닙니다.';
        root.appendChild(p);

        const guide = document.createElement('p');
        guide.className = 'muted';
        guide.textContent = '위쪽 [현재 API 연결 점검] 버튼을 눌러 점검을 시작하세요.';
        root.appendChild(guide);
      } else if (status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = '현재 로그인으로 AI 모델 응답을 점검하는 중…';
        root.appendChild(p);

        const unexecuted = document.createElement('p');
        unexecuted.className = 'student-unexecuted-notice muted';
        unexecuted.textContent = '사건 설명은 아직 실행하지 않았습니다.';
        root.appendChild(unexecuted);
      } else if (status === 'ok') {
        // audienceAuthorization 구분
        let authLabel = '확인 불가';
        if (data?.audienceAuthorization === 'test') {
          authLabel = '시험 연결 점검(test)';
        } else if (data?.audienceAuthorization === 'verified') {
          authLabel = '앱 권한 확인 후 점검(verified)';
        }

        const authP = document.createElement('p');
        authP.textContent = authLabel;
        root.appendChild(authP);

        if (mode === 'demo') {
          const demoTag = document.createElement('span');
          demoTag.className = 'tag tag-demo';
          demoTag.textContent = '예제 모드(demo)';
          root.appendChild(demoTag);
        }

        const dl = document.createElement('dl');
        dl.className = 'kv';

        const dtModel = document.createElement('dt');
        dtModel.textContent = '사용 가능 모델 수';
        const ddModel = document.createElement('dd');
        ddModel.textContent = data?.modelCount != null ? `${data.modelCount}개` : '확인 불가';
        dl.appendChild(dtModel);
        dl.appendChild(ddModel);

        const dtTime = document.createElement('dt');
        dtTime.textContent = '점검 시각';
        const ddTime = document.createElement('dd');
        ddTime.textContent = checkedAt || data?.checkedAt || '확인 불가';
        dl.appendChild(dtTime);
        dl.appendChild(ddTime);

        root.appendChild(dl);

        // 핵심: 사건 설명 미실행 명시
        const unexecuted = document.createElement('p');
        unexecuted.className = 'student-unexecuted-notice';
        unexecuted.style.color = '#1a73e8';
        unexecuted.style.fontWeight = 'bold';
        unexecuted.textContent = '사건 설명은 아직 실행하지 않았습니다.';
        root.appendChild(unexecuted);

        const notice = document.createElement('p');
        notice.className = 'muted';
        notice.textContent = '이 점검은 모델 응답 및 연결 가능 여부만 확인했습니다. 실제 사건 설명의 근거와 결과는 보안 기록에서 별도로 확인하세요.';
        root.appendChild(notice);
      } else if (status === 'error') {
        const safeCode = error?.code || '확인 불가';
        const safeMessage = error?.message || 'AI 연결 점검 중 오류가 발생했습니다.';

        const pErr = document.createElement('p');
        pErr.className = 'student-error';
        pErr.style.color = '#c5221f';
        pErr.textContent = `점검 실패 (${safeCode}): ${safeMessage}`;
        root.appendChild(pErr);

        const pGuide = document.createElement('p');
        pGuide.className = 'student-error-guide';
        pGuide.textContent = getAiErrorGuide(error?.code);
        root.appendChild(pGuide);

        const pRetry = document.createElement('p');
        pRetry.className = 'student-retry-note muted';
        pRetry.textContent = '자동으로 다시 점검하지 않습니다. 다시 점검은 위쪽 [현재 API 연결 점검] 버튼을 직접 누르세요.';
        root.appendChild(pRetry);

        const unexecuted = document.createElement('p');
        unexecuted.className = 'student-unexecuted-notice muted';
        unexecuted.textContent = '사건 설명은 실행되지 않았습니다.';
        root.appendChild(unexecuted);
      } else {
        const p = document.createElement('p');
        p.textContent = 'AI 연결 상태 확인 불가';
        root.appendChild(p);
      }

      return root;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      const root = document.createElement('div');
      root.className = 'student-explanation-container';

      // 1. explanation.status === 'error'는 event가 null이어도 최우선 처리
      if (explanation?.status === 'error') {
        const safeCode = explanation.error?.code || '확인 불가';
        const safeMessage = explanation.error?.message || 'AI 설명 요청에 실패했습니다.';

        root.setAttribute('data-student-explanation-error', safeCode);

        const h4 = document.createElement('h4');
        h4.textContent = event ? `사건 ${event.id} AI 설명 실패` : 'AI 설명 실패';
        root.appendChild(h4);

        const pErr = document.createElement('p');
        pErr.className = 'student-error';
        pErr.style.color = '#c5221f';
        pErr.textContent = `AI 설명 실패 (${safeCode}): ${safeMessage}`;
        root.appendChild(pErr);

        const pPreserved = document.createElement('p');
        pPreserved.className = 'student-preserved-note muted';
        pPreserved.textContent = '기록은 그대로 유지됩니다.';
        root.appendChild(pPreserved);

        // 오류이므로 data-student-explanation-event 속성을 붙이지 않고 반환
        return root;
      }

      // 2. 오류가 아닌데 event가 없는 경우
      if (!event) {
        const p = document.createElement('p');
        p.className = 'student-empty muted';
        p.textContent = '보안 기록에서 기록을 먼저 고르세요.';
        root.appendChild(p);
        return root;
      }

      const status = explanation?.status;

      // 3. loading 상태
      if (status === 'loading') {
        const p = document.createElement('p');
        p.className = 'student-loading';
        p.textContent = `사건 ${event.id}에 대한 AI 설명 요청 중입니다…`;
        root.appendChild(p);
        return root;
      }

      // 4. ok 상태 (상세 검증 및 렌더링)
      if (status === 'ok') {
        const data = explanation?.data;

        // Helper: 쓸 수 없는 설명 (unusable) 거절 함수
        const rejectUnusable = (reason) => {
          root.setAttribute('data-student-unusable-explanation', 'true');

          const h4 = document.createElement('h4');
          h4.textContent = `사건 ${event.id} 쓸 수 없는 설명(unusable)`;
          root.appendChild(h4);

          const pReason = document.createElement('p');
          pReason.className = 'student-error';
          pReason.style.color = '#c5221f';
          pReason.textContent = `쓸 수 없는 설명(unusable): ${reason}`;
          root.appendChild(pReason);

          const pPreserved = document.createElement('p');
          pPreserved.className = 'student-preserved-note muted';
          pPreserved.textContent = '원본 기록은 그대로 유지됩니다.';
          root.appendChild(pPreserved);

          // data-student-explanation-event 속성은 절대 붙이지 않음
          return root;
        };

        // (1) data 유효성 검사 (null, 배열, 비객체 차단)
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          return rejectUnusable('응답 데이터 형식이 올바르지 않습니다.');
        }

        // (2) summary 검사
        if (typeof data.summary !== 'string' || data.summary.trim().length === 0) {
          return rejectUnusable('요약 내용이 없거나 올바르지 않습니다.');
        }

        // (3) executed 검사 (AI가 이미 실행했다고 답한 설명은 거절)
        if (data.executed === true) {
          return rejectUnusable('AI가 이미 실행했다고 답한 설명은 쓸 수 없습니다.');
        }

        // (4) requiresHumanConfirmation 검사
        if (data.requiresHumanConfirmation !== true) {
          return rejectUnusable('사람 확인이 필요하지 않다고 명시된 설명은 쓸 수 없습니다.');
        }

        // (5) evidenceIds 검사 (배열 여부 및 비어있는지)
        if (!Array.isArray(data.evidenceIds) || data.evidenceIds.length === 0) {
          return rejectUnusable('인용한 근거 ID가 없습니다.');
        }

        // event.evidence 대조
        const eventEvidenceMap = new Map();
        if (Array.isArray(event.evidence)) {
          for (const e of event.evidence) {
            if (e && typeof e.id === 'string') {
              eventEvidenceMap.set(e.id, e.text || '');
            }
          }
        }

        // 모든 evidenceId가 event.evidence에 존재하는지 검사
        for (const ref of data.evidenceIds) {
          if (!eventEvidenceMap.has(ref)) {
            return rejectUnusable(`인용한 근거 ID(${ref})가 이 기록의 근거에 존재하지 않습니다.`);
          }
        }

        // (6) proposals 검사
        if (!Array.isArray(data.proposals)) {
          return rejectUnusable('조치 제안 목록 형식이 올바르지 않습니다.');
        }

        const supportedActions = Array.isArray(event.supportedActions) ? event.supportedActions : [];
        for (const prop of data.proposals) {
          if (!prop || typeof prop.action !== 'string') {
            return rejectUnusable('조치 제안 형식이 올바르지 않습니다.');
          }
          if (!supportedActions.includes(prop.action)) {
            return rejectUnusable(`기록의 연동 시스템이 지원하지 않는 조치(${prop.action})가 제안되었습니다.`);
          }
        }

        // --- 모든 검증 통과: 성공 표식 부여 및 정상 렌더링 ---
        root.setAttribute('data-student-explanation-event', event.id);

        const h4 = document.createElement('h4');
        h4.textContent = `사건 ${event.id} AI 설명(참고용)`;
        root.appendChild(h4);

        const pSummary = document.createElement('p');
        pSummary.className = 'student-explanation-summary';
        pSummary.textContent = data.summary;
        root.appendChild(pSummary);

        // 1) 인용한 근거 목록
        const h5Evidence = document.createElement('h5');
        h5Evidence.textContent = '인용한 근거 목록';
        root.appendChild(h5Evidence);

        const ulEvidence = document.createElement('ul');
        for (const ref of data.evidenceIds) {
          const li = document.createElement('li');
          li.textContent = `${ref} — ${eventEvidenceMap.get(ref)}`;
          ulEvidence.appendChild(li);
        }
        root.appendChild(ulEvidence);

        // 2) 현재 규칙 목록
        const h5Rules = document.createElement('h5');
        h5Rules.textContent = '현재 규칙 목록';
        root.appendChild(h5Rules);

        const ulRules = document.createElement('ul');
        const rulesList = Array.isArray(event.rules) ? event.rules : [];
        if (rulesList.length === 0) {
          const pNoRules = document.createElement('p');
          pNoRules.className = 'muted';
          pNoRules.textContent = '적용된 규칙 없음';
          root.appendChild(pNoRules);
        } else {
          for (const rule of rulesList) {
            const li = document.createElement('li');
            li.textContent = `${rule.id} — ${rule.text || ''}`;
            ulRules.appendChild(li);
          }
          root.appendChild(ulRules);
        }

        // 3) 확인되지 않은 현재 상태 (access, session, device)
        const h5Unknown = document.createElement('h5');
        h5Unknown.textContent = '확인되지 않은 현재 상태';
        root.appendChild(h5Unknown);

        const stateObj = event.state || {};
        const unknownList = [];
        if (stateObj.access === 'unknown') unknownList.push('접속: 확인 불가(unknown)');
        if (stateObj.session === 'unknown') unknownList.push('세션: 확인 불가(unknown)');
        if (stateObj.device === 'unknown') unknownList.push('기기: 확인 불가(unknown)');

        if (unknownList.length === 0) {
          const pNoUnknown = document.createElement('p');
          pNoUnknown.className = 'muted';
          pNoUnknown.textContent = '없음';
          root.appendChild(pNoUnknown);
        } else {
          const ulUnknown = document.createElement('ul');
          for (const item of unknownList) {
            const li = document.createElement('li');
            li.textContent = item;
            ulUnknown.appendChild(li);
          }
          root.appendChild(ulUnknown);

          const pUnknownWarn = document.createElement('p');
          pUnknownWarn.className = 'muted';
          pUnknownWarn.textContent = '확인할 수 없는 상태를 정상이나 안전으로 판단하지 않습니다.';
          root.appendChild(pUnknownWarn);
        }

        // 4) 조치 제안 (proposals)
        const h5Proposals = document.createElement('h5');
        h5Proposals.textContent = '조치 제안';
        root.appendChild(h5Proposals);

        if (data.proposals.length === 0) {
          const pNoProp = document.createElement('p');
          pNoProp.className = 'muted';
          if (supportedActions.length === 0) {
            pNoProp.textContent = '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).';
          } else {
            pNoProp.textContent = 'AI가 제안한 조치가 없습니다.';
          }
          root.appendChild(pNoProp);
        } else {
          const ulProposals = document.createElement('ul');
          for (const prop of data.proposals) {
            const li = document.createElement('li');
            li.textContent = `${prop.action} — ${prop.reason || '이유 없음'}`;
            ulProposals.appendChild(li);
          }
          root.appendChild(ulProposals);

          const pPropNotice = document.createElement('p');
          pPropNotice.className = 'muted';
          pPropNotice.textContent = '사람 확인이 필요하며 아직 실행되지 않았습니다. 연동 시스템에서 지원하지 않으면 집행할 수 없습니다.';
          root.appendChild(pPropNotice);
        }

        // 5) 점검 시각 및 안내 고지
        if (checkedAt) {
          const pTime = document.createElement('p');
          pTime.className = 'muted';
          pTime.textContent = `설명 확인 시각: ${checkedAt}`;
          root.appendChild(pTime);
        }

        const pNotice = document.createElement('p');
        pNotice.className = 'muted';
        pNotice.textContent = 'AI 설명은 참고용 해석이며, 사실 판단은 인용한 근거와 원천이 알려 준 현재 상태를 기준으로 하세요.';
        root.appendChild(pNotice);

        return root;
      }

      // 5. idle 및 기타 상태
      const p = document.createElement('p');
      p.className = 'student-idle muted';
      p.textContent = `사건 ${event.id}에 대한 AI 설명 대기 중`;
      root.appendChild(p);

      return root;
    },
    renderAction({ status = 'idle', event, actionId, target, receipt, observation, message, confirmationExpiresAt, error } = {}) {
      const root = document.createElement('div');
      const line = (text) => {
        const p = document.createElement('p');
        p.textContent = text;
        root.appendChild(p);
      };
      const confirmed = status === 'succeeded' && observation?.effectApplied === true;
      const effectiveStatus = status === 'succeeded' && !confirmed ? 'unknown' : status;
      const labels = {
        idle: '아직 미실행(idle). AI 조치 제안은 실행되지 않았습니다.',
        loading: '조회 또는 조치 준비 중(loading). 실행 결과는 아직 확인되지 않았습니다.',
        prepared: '준비됨(prepared) · 아직 미실행. 제공 화면에서 사람이 현재 대상과 조치를 직접 확인한 뒤에만 실행합니다.',
        executing: '서버에 전달 중(executing). 결과는 아직 확인되지 않았으며 완료가 아닙니다.',
        pending: '서버 접수·처리 중(pending). 서버가 받았다는 ACK는 실제 효과가 아닙니다. 결과는 아직 확인되지 않았습니다.',
        succeeded: '원천 관측으로 실제 효과 확인(succeeded).',
        denied: '원천 거절(denied).',
        failed: '처리 실패(failed).',
        unknown: '결과 불명(unknown). 성공이나 효과 없음으로 단정하지 마세요. 재실행 대신 제공 화면의 「원천 결과만 재조회」를 사용하세요.',
        expired: '확인 기한 지남(expired). 현재 사건과 대상을 다시 확인하고 조치를 다시 준비하세요.',
        error: '요청 처리 안 됨(error).'
      };
      line(labels[effectiveStatus] || labels.unknown);
      if (message) line(message);
      if (error) line(`${error.code || '확인 불가'}: ${error.message || '확인 불가'}`);
      if (event?.id) line(`사건 ID: ${event.id}`);
      for (const evidence of event?.evidence || []) {
        if (evidence?.id) line(`근거 ID: ${evidence.id}`);
      }
      if (actionId) line(`조치 ID: ${actionId}`);
      if (target?.id) line(`실제 대상 ID: ${target.id} · 세대: ${target.generation ?? '확인 불가'}`);
      if (confirmationExpiresAt) line(`사람 확인 기한: ${confirmationExpiresAt}`);
      for (const field of ['requestId', 'receiptId', 'version', 'replayed', 'superseded']) {
        if (receipt?.[field] !== undefined) line(`${field}: ${receipt[field]}`);
      }
      if (observation) {
        line(`원천 관측 시각: ${observation.observedAt ?? '확인 불가'}`);
        line(`effectApplied: ${observation.effectApplied ?? '확인 불가'}`);
      }
      if (!['idle', 'error'].includes(effectiveStatus) && labels[effectiveStatus]) {
        if (event?.id) root.setAttribute('data-student-action-event', event.id);
        if (receipt?.requestId) root.setAttribute('data-student-action-request', receipt.requestId);
      }
      line('버튼 조작은 제공 화면에서 직접 진행하세요. 학생 표시는 조치를 실행하지 않습니다.');
      return root;
    },
    renderVulnerabilities({ status = 'idle', mode, data, error } = {}) {
      const root = document.createElement('div');
      const line = (text, parent = root) => {
        const p = document.createElement('p');
        p.textContent = text;
        parent.appendChild(p);
      };
      const badge = renderModeBadge(mode);
      if (badge) root.appendChild(badge);
      if (status === 'idle') { line('설치 패키지 조회 전(idle).'); return root; }
      if (status === 'loading') { line('설치 패키지 조회 중(loading).'); return root; }
      if (status === 'error') {
        root.setAttribute('data-student-error', error?.code || 'UNKNOWN');
        line(`패키지 조회 실패: ${error?.message || '확인 불가'} (${error?.code || '확인 불가'})`);
        line('조회 실패는 취약점 없음이 아닙니다. 제공 화면에서 직접 다시 조회하세요.');
        return root;
      }
      const overall = {
        complete: '모두 조회', partial: '일부 조회 실패', not_checked: '아직 조회 안 함',
        not_configured: '조회 준비 미완료', unverifiable: 'lock 파일 확인 불가'
      };
      line(`${overall[data?.status] || '조회 확인 불가'} (${data?.status || 'unknown'})`);
      line(`잠금 버전: ${data?.lockfileVersion ?? '확인 불가'}`);
      line(`잠금 해시: ${data?.lockfileHash ?? '확인 불가'}`);
      line(`조회 시각: ${data?.checkedAt ?? '확인 불가'}`);
      const packages = Array.isArray(data?.packages) ? data.packages : [];
      if (!packages.length) line('표시할 설치 패키지가 없습니다. 전체 조회 상태를 확인하세요.');
      for (const pkg of packages) {
        const row = document.createElement('section');
        row.setAttribute('data-student-package-name', pkg.name ?? '확인 불가');
        row.setAttribute('data-student-package-version', pkg.version ?? '확인 불가');
        const labels = { known_vulnerabilities: '알려진 항목 있음', none_found: '알려진 항목 없음', unverifiable: '조회 확인 불가', not_checked: '아직 조회 안 함' };
        line(`${pkg.name ?? '확인 불가'}@${pkg.version ?? '확인 불가'} · ${labels[pkg.status] || '조회 확인 불가'} (${pkg.status ?? 'unknown'})`, row);
        line(`출처: ${pkg.source ?? '확인 불가'} · 조회 시각: ${pkg.checkedAt ?? '확인 불가'}`, row);
        const vulnerabilities = Array.isArray(pkg.vulnerabilities) ? pkg.vulnerabilities : [];
        if (pkg.status === 'unverifiable' && vulnerabilities.length) line('일부 확인 · 전체 조회 확인 불가', row);
        for (const vulnerability of vulnerabilities) {
          line(`취약점 ID: ${vulnerability.id ?? '확인 불가'} · 수정 시각: ${vulnerability.modified ?? '확인 불가'}`, row);
        }
        root.appendChild(row);
      }
      line('조회 실패·미조회·확인 불가는 취약점 없음이 아닙니다. 알려진 항목이 없어도 안전을 보증하지 않습니다.');
      return root;
    },
  };
}
