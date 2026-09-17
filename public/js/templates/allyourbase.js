export default {
  key: 'allyourbase',
  label: 'All Your Base',
  description: 'A CATS system transmission log and printer diagnostic override.',
  icon: 'fa-bomb',
  badge: { text: 'MEME', className: 'bg-red-600 text-white font-mono' },
  borderClasses: 'border-red-900/50 hover:border-red-700 bg-red-950/30 hover:bg-red-900/40',
  radioAccent: 'accent-red-500',
  labelTextClass: 'text-red-400',
  configType: 'bw',
  multiPage: false,

  render(state) {
    return `
      <style>
        .ayb-container {
          font-family: "Courier New", Courier, monospace;
          color: #000;
          line-height: 1.4;
        }
        .ayb-box {
          border: 2px solid #000;
          padding: 12px;
          margin-bottom: 16px;
        }
        .ayb-header-title {
          font-size: 20px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .ayb-subhead {
          font-size: 11px;
          font-weight: bold;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .ayb-speaker {
          font-weight: bold;
          display: inline-block;
          width: 120px;
        }
        .ayb-dialogue-line {
          margin-bottom: 4px;
          font-size: 13px;
        }
        .ayb-alert-banner {
          background-color: #000;
          color: #fff;
          text-align: center;
          padding: 8px;
          font-weight: bold;
          font-size: 18px;
          letter-spacing: 2px;
          margin: 16px 0;
        }
        .ayb-code-block {
          background-color: #f8f8f8;
          border: 1px dashed #000;
          padding: 10px;
          font-size: 11px;
          white-space: pre-wrap;
        }
      </style>

      <div class="ayb-container p-6 max-w-4xl mx-auto">
        <div class="flex justify-between items-end border-b-4 border-black pb-2 mb-4">
          <div>
            <h1 class="ayb-header-title">PRINTER TRANSMISSION INTERCEPT</h1>
            <div class="text-xs font-bold">SUB-ROUTINE: CATS_OVERRIDE_V2.10</div>
          </div>
          <div class="text-right text-xs">
            <div>STATUS: UNPROTECTED BROADCAST</div>
            <div>ORIGIN: CATS MAIN COMMAND</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4 text-xs border border-black p-3 bg-gray-50">
          <div>
            <div><strong>DEVICE:</strong> MAIN PRINT ENGINE</div>
            <div><strong>PORT:</strong> LPT1 / PARALLEL OVERRIDE</div>
            <div><strong>ERR CODE:</strong> 0x80040509 (BOMB_DETECTED)</div>
          </div>
          <div>
            <div><strong>PROTOCOL:</strong> ZERO WING UNSECURE</div>
            <div><strong>SIGNAL:</strong> INBOUND OVERRIDE</div>
            <div><strong>ACTION:</strong> TAKE OFF EVERY 'ZIG'</div>
          </div>
        </div>

        <div class="ayb-alert-banner">
          *** SOMEBODY SET UP US THE BOMB ***
        </div>

        <div class="ayb-box">
          <div class="ayb-subhead">DECODED TRANSMISSION LOG</div>
          <div class="space-y-1">
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">MECHANIC:</span>
              <span>In A.D. 2026, war was beginning.</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CAPTAIN:</span>
              <span>What happen?</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">MECHANIC:</span>
              <span>Somebody set up us the bomb.</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">OPERATOR:</span>
              <span>We get signal.</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CAPTAIN:</span>
              <span>What !</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">OPERATOR:</span>
              <span>Main screen turn on.</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CAPTAIN:</span>
              <span>It's you !!</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CATS:</span>
              <span>How are you gentlemen !!</span>
            </div>
            <div class="ayb-dialogue-line font-bold text-base my-2">
              <span class="ayb-speaker">CATS:</span>
              <span>ALL YOUR BASE ARE BELONG TO US.</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CATS:</span>
              <span>You are on the way to destruction.</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CAPTAIN:</span>
              <span>What you say !!</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CATS:</span>
              <span>You have no chance to survive make your time.</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CATS:</span>
              <span>Ha Ha Ha Ha ...</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">OPERATOR:</span>
              <span>Captain !!</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CAPTAIN:</span>
              <span>Take off every 'Zig' !!</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CAPTAIN:</span>
              <span>You know what you doing.</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CAPTAIN:</span>
              <span>Move 'Zig'.</span>
            </div>
            <div class="ayb-dialogue-line">
              <span class="ayb-speaker">CAPTAIN:</span>
              <span>For great justice.</span>
            </div>
          </div>
        </div>

        <div class="ayb-code-block font-mono">
SYSTEM MEMORY DUMP:
0x00000000: 41 4C 4C 20 59 4F 55 52  20 42 41 53 45 20 41 52  ALL YOUR BASE AR
0x00000010: 45 20 42 45 4C 4F 4E 47  20 54 4F 20 55 53 2E 21  E BELONG TO US.!
0x00000020: 53 4F 4D 45 42 4F 44 59  20 53 45 54 20 55 50 20  SOMEBODY SET UP 
0x00000030: 55 53 20 54 48 45 20 42  4F 4D 42 2E 20 5A 49 47  US THE BOMB. ZIG
        </div>
      </div>
    `;
  }
};
