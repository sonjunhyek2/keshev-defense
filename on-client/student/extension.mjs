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
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
