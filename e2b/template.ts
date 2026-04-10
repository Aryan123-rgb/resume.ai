import { Template } from 'e2b'

export const template = Template()
  .fromImage('ubuntu:22.04')
  .setUser('root')
  .setEnvs({ DEBIAN_FRONTEND: 'noninteractive' })
  // Combine user creation and package installation to keep the image layers clean
  .runCmd(
    'apt-get update && apt-get install -y ' +
    'texlive-latex-base ' +
    'texlive-fonts-recommended ' +
    'texlive-fonts-extra ' +
    'texlive-latex-extra ' +
    'texlive-xetex ' + // Optional: helpful if you use specific fonts
    'ghostscript ' +
    'perl ' +
    '&& useradd -m -s /bin/bash user ' +
    '&& rm -rf /var/lib/apt/lists/*'
  )
  .setUser('user')
  .setWorkdir('/home/user')