export default {
  key: 'spaceball',
  label: 'Spaceball One',
  description: 'High-speed print test with CMYK bars, a Ludicrous Speed status log, and an abrupt plaid transition.',
  icon: 'fa-jedi',
  badge: { text: 'NEW', className: 'bg-amber-500 text-slate-950' },
  borderClasses: 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50',
  radioAccent: 'accent-amber-500',
  labelTextClass: 'text-amber-300',
  configType: 'color',
  multiPage: false,

  render() {
    return `
      <div class="spaceballs-page">
        <header class="sb-header">
          <h1>SPACEBALL ONE HIGH-SPEED PRINT TEST</h1>
          <p class="sb-subtitle">SYSTEM DIAGNOSTIC & CALIBRATION SHEET</p>
        </header>

        <section class="sb-visual-element">
          <div class="sb-color-bar-container">
            <div class="sb-color-bar sb-cyan">C 100%</div>
            <div class="sb-color-bar sb-magenta">M 100%</div>
            <div class="sb-color-bar sb-yellow">Y 100%</div>
            <div class="sb-color-bar sb-black">K 100%</div>
          </div>
          <div class="sb-plaid-break-line">▲ ABRUPT TRANSITION TO PLAID PATTERN ▲</div>
          <div class="sb-plaid-pattern">
            <div class="sb-plaid-overlay-text">THEY'VE GONE TO PLAID!</div>
          </div>
        </section>

        <section class="sb-status-log">
          <div class="sb-status-title">--- SYSTEM STATUS LOG ---</div>

          <div class="sb-status-row">
            <span class="sb-label">CURRENT SPEED:</span>
            <span class="sb-option">Light Speed <span class="sb-checkbox">[ ]</span></span>
            <span class="sb-option">Ridiculous Speed <span class="sb-checkbox">[ ]</span></span>
            <span class="sb-option sb-bold">Ludicrous Speed <span class="sb-checkbox">[X]</span></span>
          </div>

          <div class="sb-status-row sb-alert">
            <span class="sb-label">FUSER TEMP:</span>
            <span class="sb-value">OVERHEAT — THEY'VE GONE TO PLAID!</span>
          </div>
        </section>

        <section class="sb-tech-note">
          <strong>Technician Note:</strong> "What's the matter, Colonel Sandurz? Chicken?"
        </section>

        <footer class="sb-footer">
          Officially certified by Yogurt's Merchandising Department ("Spaceballs: The Test Page! The kids love it.").
        </footer>
      </div>

      <style>
        .spaceballs-page {
          font-family: "Courier New", Courier, monospace;
          color: #000;
        }

        .sb-header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .sb-header h1 {
          font-family: 'Arial Black', Impact, sans-serif;
          font-size: 18pt;
          margin: 0;
          letter-spacing: 1px;
        }

        .sb-subtitle {
          font-size: 9pt;
          margin-top: 5px;
          letter-spacing: 2px;
        }

        .sb-visual-element {
          margin: 20px 0;
          border: 2px solid #000;
        }

        .sb-color-bar-container {
          display: flex;
          height: 35px;
        }

        .sb-color-bar {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 9pt;
        }

        .sb-cyan { background-color: #00FFFF; color: #000; }
        .sb-magenta { background-color: #FF00FF; color: #fff; }
        .sb-yellow { background-color: #FFFF00; color: #000; }
        .sb-black { background-color: #000000; color: #fff; }

        .sb-plaid-break-line {
          background: #000;
          color: #fff;
          text-align: center;
          font-size: 8pt;
          font-weight: bold;
          letter-spacing: 1px;
          padding: 2px 0;
        }

        .sb-plaid-pattern {
          height: 160px;
          position: relative;
          background-color: #b00;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(0,0,0,0.8) 15px, rgba(0,0,0,0.8) 30px, transparent 30px, transparent 45px, rgba(255,255,255,0.8) 45px, rgba(255,255,255,0.8) 48px),
            repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.8) 15px, rgba(0,0,0,0.8) 30px, transparent 30px, transparent 45px, rgba(255,255,255,0.8) 45px, rgba(255,255,255,0.8) 48px),
            repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,215,0,0.5) 20px, rgba(255,215,0,0.5) 25px);
        }

        .sb-plaid-overlay-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          padding: 8px 16px;
          font-family: 'Arial Black', Impact, sans-serif;
          font-size: 13pt;
          border: 2px solid #fff;
          letter-spacing: 2px;
        }

        .sb-status-log {
          border: 2px dashed #000;
          padding: 15px;
          margin: 20px 0;
          background: #fdfdfd;
        }

        .sb-status-title {
          font-weight: bold;
          text-align: center;
          margin-bottom: 12px;
        }

        .sb-status-row {
          margin: 10px 0;
          font-size: 10pt;
        }

        .sb-status-row .sb-label {
          font-weight: bold;
          margin-right: 10px;
        }

        .sb-status-row .sb-option {
          margin-right: 15px;
        }

        .sb-status-row.sb-alert {
          color: #b00;
          font-weight: bold;
        }

        .sb-checkbox {
          font-family: monospace;
        }

        .sb-tech-note {
          border-left: 4px solid #000;
          padding: 8px 12px;
          margin: 20px 0;
          font-style: italic;
          background: #f5f5f5;
          font-size: 10pt;
        }

        .sb-footer {
          border-top: 1px solid #000;
          padding-top: 12px;
          margin-top: 25px;
          text-align: center;
          font-size: 8pt;
          letter-spacing: 0.5px;
        }

        @media print {
          .sb-plaid-pattern, .sb-color-bar {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    `;
  }
};
