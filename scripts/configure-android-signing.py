from pathlib import Path
import os
p = Path('android/app/build.gradle')
s = p.read_text()
if 'kifnetReleaseSigning' in s:
    raise SystemExit(0)
block = """

    signingConfigs {
        kifnetReleaseSigning {
            storeFile file(System.getenv('KIFNET_KEYSTORE_PATH'))
            storePassword System.getenv('KIFNET_KEYSTORE_PASSWORD')
            keyAlias System.getenv('KIFNET_KEY_ALIAS')
            keyPassword System.getenv('KIFNET_KEY_PASSWORD')
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.kifnetReleaseSigning
        }
    }
"""
idx = s.rfind('}')
if idx < 0:
    raise SystemExit('android/app/build.gradle format not recognized')
p.write_text(s[:idx] + block + s[idx:])
