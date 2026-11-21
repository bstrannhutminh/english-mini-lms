# Premium Learning Studio — session redesign and verification

Session source owner: shell + four skill modes only. No controller, hooks, contracts, provider, DB or secret changed. Existing dirty learning functionality preserved. Changes: compact header/timer/save status; source/editor desktop5:7 split; mobile source disclosure initially open and kept mounted; writing editorial prompt + primary editor; reading threefields in one workspace; neutral recording station; player/questions priority with locked transcript receipt preserved; sticky submit reserve unchanged.

## Verification

- ScopedESLint on session/shell and modes: PASS,0warnings.
- Targeted hermetic unit tests:82PASS,12files (hintreceipt,reading/speakingplugins,timer,capture,wordtargets,listeningstate/answercheck/transcriptgate/evaluator).
- Browser before/after:8modes (writing/reading/speaking/listening + fourIELTSvariants) ×320/375/768/1440. ActualChrome screenshots: `premium-studio-artifacts/{before,after}-{mode}-{width}.png`; [beforemetrics](premium-studio-artifacts/before-matrix.json), [aftermetrics](premium-studio-artifacts/after-matrix.json).
- Critical nativeinteraction check receipt: [21/21PASS](premium-studio-artifacts/session-qa-checks.json). Sourcecollapse keepsDOM/editorstate,autosavepending/failure/retry,submit503preservesdraft,exitmodal/Escape,timerpause/resume,hintreceiptfailureclosed/success,transcriptinitiallock,nativeradio,revealfailureclosed,successfulrevealawaitsserverrefresh,exactrevealeventpayload.
- [Networkreceipt](premium-studio-artifacts/session-qa-network.json) shows synthetic requests only. All mutations intercepted, externalYouTube blocked beforeprovider. Noaudio actuallyrecorded, noDBmutation.
- [Finalsessionhashes](premium-studio-artifacts/session-final-hashes.json): every session source file matches isolatedpreview. Globals independently synced byparent after allbaselinecaptured; allbaselinecopies remain in `/private/tmp/lms-premium-rest-baseline`.

## Fixture limits and review

Actualfrontend components/hooks used under syntheticprops, blankprovider player while externalnetworkblocked. Noauth/DB/provider readiness claim. Consistent systemfont fallback; InterGooglefont notfetched. Mainserver3000 untouched. SharedNextdevfixture3035 was cleanlyrestarted after staleHMR brokehydration; `.next-before-clean-restart` preserved. Nativeclick waits on Reactprops thereafter; earlierfailedharnessruns do not constitute appfailures. Latest21checkreceipt valid. UnsupportedCDPpermissionname `audioCapture` stopped micdenialtest after21successes; microphonepermission/upload/redo is NOT VERIFIED. NativefontscaleA+ scrolltest inconclusive; original fontscale handlers unchanged. NativeiOSkeyboard/safearea,realmedia/playback,autosaveinterval30sec,actualAIfeedback and fullsubmit-success flow unverified. Parentmayappend independent nativechecks from work-vocab/session-qa.

Visualcritique: source now reads like a document, primary workspace carries the single teal cue, readingfields grouped instead of equalcards, recorder space centers the task. Header lighter ondesktop and mobile; source can collapse to editor without losingstate. Directly inspected writing375/1440, othermatrixcaptures preserved forparentreview. Uservisualacceptance beyondToday remains pending.

Independent read-only review of parent MyWork/Vocab/globals found no actionable correctnessregression: top3priority + remainingobservations retainindices, comparelinks remain, vocabularyhotkeys/TTS/YouGlish state untouched. Simplification reviewed inline; no edits justified.

Preview retained at http://127.0.0.1:3035/learn/writing (also reading/speaking/listening/ielts-*). It uses an isolatedcopy and synthetic lessondata, not the authenticated application.
