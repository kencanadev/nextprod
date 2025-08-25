import React from 'react'

const resource = () => {
  return (
    <div>resource</div>
  )
}

export default resource

type ImageType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt' | 'csv' | 'html' | 'zip' | '7z' | 'rar' | 'tar' | 'exe' | 'apk';
const imageFiles = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
const audioFiles = ['mp3', 'mpga', 'm4a', 'wma', 'aac', 'ogg', 'flac', 'alac', 'wav', 'aiff', 'dsd', 'pcm'];
const videoFiles = ['mp4', 'mov', 'wmv', 'avi', 'flv', 'f4v', 'swf', 'mkv', 'mts', 'avchd', 'webm', 'mpg', 'mpeg'];

const resImage =
    'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAADxUlEQVR4nO2ZzUtUYRTG55+4NkafkpuCFlLLoFWLyLCdf4BfMYVmpFjaIFINlXZwEUHashZBWKsikvEDdSYQ8gvERb2oK80WNqgEnbhDt9SZ8d65M/XM+8554Nnckbt4fud93nswEBCJRCKRSCQS+RDFt1gzR4wCXQCBclFDKIAwuaghFECQ7MXv1Q8zIaCDJY9WiZ9mQtAJgDIRgm4AlGkQdASgTIKgKwBlCgSdASgTIOgOQOkOwQQASmcIpgBQukIwCYDSEYJpAJRuEEwEoHSCYCoApQsEkwEoHSCYDkAVOoRiAKAKGUKxAFAZIKDzLyoAKg0EdP7aAKB/ZHT+AgAt9ASSnAB8CCQVhA+CQEY3kFQQWugJJDkB+BBIKggfBIGMbiCpILTQE0hyAvAhkFQQPggCGd1AUkFooSeQ5ATgQyCpIHwQBDK6gaSC0PofU1bzYplrny/n5V09E5tc1bfE5bdnuTw8x1X9S8lncgLi6QPriq7zoSujfCA0yp2D6zkDsAMvbZnaYfuZAIinhvUotsWnw5Ns1UaTruiY5J6Y/2m1bU/+bgD2MwEQTw2ruu/zn/AdV/d/yQ1AeC4VQHhOANCuoNrffePShuEUAMGGYW57u5bXCrokFbS1I6Tu8Q0+0RpPCd/x8Rsxfji+4f8S7l9KTr1cwvH0IV3onc8YvuPK3nn3sGObOd8ZbjbuM7T5zQqX1O0dvm37b5oGVvZ8l10tl575/8IpOgCRkQQfuzbmGr7jssYxvjeSSPuuq6/XeH/rVNKhga8CwAuAs5EZz+E7PnN3OuU9XdEEl3X8/do5emuWO6Pf5QS4bbtWluE73r4ld09s8qn7CylfOhWRhZw2XqMrqOv3tusXwPYtufLpYkr4ji/2LQoAt23X8ml7Sw4NrCY7PxMA+7fLr1blBLhtu5Yf14/wwbbpjOE7PtI+y+HB/N0HWldQe4ZtN3sPcbB50jV8xyfvzPte5IwB4LbtWlk42Bj3HL7j80/ycx9oC8DLtmt58L7QWNbhO655uVKcALxuu5aLS+qHubTlk28Ah2/OcMeH3P7HoB2AbLddK5Prhjh43Xvv73UfPMjhPtAOgJ9t10rX+00fcw7f8bnHqngAmOYAWugASADgQyA5AfggCGR0A0kFoYWeQJITgA+BpILwQRDI6AaSCkILPYEkJwAfAkkF4YMgkNENJBWEFnoCSU4APgSSCsIHQSCjG0gqCC30BJKcAHwIJBWED4JARjeQVBBa6AkkOQH4EEgqCB8EgYxuIJFIJBKJRKKAlvoFEO70QtyIcC0AAAAASUVORK5CYII=';
const resAudio =
    'data:@file/png;base64,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';
const resVideo =
    'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAJbSURBVHhe7ds9bhNBHMbhMcIE8SFFQuISqUCipE8PBRwgLTSE+AiG0ECbA0BDzymgyiWQkCLxIcAIE8JKCMlk7Y3/9uzM8zSe3XL8k9/KCQAAAAAAAAAAAAAAAAAAAAAAADIyaD576+H9o2lz7IXpND158Wpz1DwW61zzyYoMBmnvwb2jcfNYLGGtQQ1xCWtFbt/daE5/lB6XsFbk1vZGVXEJa4VqiktYK1ZLXMJagxriEtaalB6XsNao5LiEtWalxiWsDJQYl7AyUVpcwspISXEJKzOlxCWsDJUQl7Ay1fe4hJWxPsclrMz1NS5h9UAf4xJWT/wvruaYHWH1yKy4cuVfOj33/OVmlt+hXyxCCIsQwiKEsAghLEIIixDCIoSwCCEsQgiLEMIihLAIISxCCIsQwiKEsFrs7F5O1667pkW5sRZbN86n0dMrafvOxTQcNi9pJaw5DC8MjsPaSKP9q2nrprrmIawF/J7EnUeXzOMc3E4H5rGdsDoyj6cT1hmZx9ncxJKYx38Ja4nM41/CCmAehRWq5nkUVrBa51FYhBBWsMn3aXrz+lsa735Mh28nzdvyCSvQ4bsfafz403FYX9OknqZOCCvAh/c/08GzL+lg//PJuUbCWqJaZ28WYS1JzbM3i7DOyOzNJqyOzN7phNWB2WsnrAWYvfkJaw5mb3HCamH2uhFWC7PXjbAIISxCCIsQwiKEsAghLEIIixDCIoSwCCEsQgiLEMIihLAIISxCCIsQwiKEsAghLEIIixDCIoSwAAAAAAAAAAAAAAAAAAAAAAAAAAAykdIvyB3aRXtnTukAAAAASUVORK5CYII=';
const resExcel =
    'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAUQSURBVHhe7d3vT1V1HMDxjxbNX81K/EXpUlDUdJWmoICR4rQHtXJr2kBR+2m6SmqrP6GetLV+rLkKBUlcCW2OXA+qWWaA4tKJD3TNtJVJOCEgkV/GuXwUz/Wcy33gF8493/fryf1+zsYj3nzPvYcvQwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAGaavCSvzveyrukwU71YXHXxb16E1XF8xeN7q/WF4R9ehRVhDI/RxEdYgWZ9RoKvrQh0XYQ2S1Q89bVVchDWIbIqLsAaZLXER1hCwIS7CGiJhj4uwhlCY4yKsIRbWuAgrAMIYF2EFRNjiIqwACVNchBUwYYmLsAIoDHERVkAlelyEFWCJHBdhBVyixkVYCSAR4yKsBOEXl74GDmElEJ+4Aom/0klw1UUHA/k9ZMeCEYQFIwgLRhAWjCAsGEFYMIKwYARhwQjCghGEBSMIC0YQFowgLBhBWDCCsGAE57Gi5KUvlwVT5uvk9t2p7+XIuTqdbrZk2mLJSc3Wya32bK38cPqATrdOUM9jEVaUe8emyO7CXZJ0W5Je6Xfm4u9SUFooPVd79Eq/4cOGS/mGMply1316pV9HV4es3Zkv5//9W6/cOhz0SxB/Nv8le49V6uQ2bdz98mhajk5uq2av9IzKUX50j5GogoywPHxes0Oa25t1ctuYsaF3m3dvEs5uVbjI+yz6pf8uSemRMp3sQVgeWtpbpLh6p05uM8anSXZqlk59VqTnydS7p+rktv3Qp9J6pU0nexCWD+d2eO7SHzq5PZe58fqu5exW6xfmR9bRnPdk++qrdLILYfno6umSj376WCe39AkzZfG0zMh62czHZHry9Mg62vsHPpDunm6d7EJYMfz420E5fO6ITm6bMvveaxUuWqdX3H4+84vUnK3VyT6ENYAPe3ctr8cLD0yaI28uK5K05FS90s/Zpfx2O1sQ1gBONZyW/Se/1clt9YNP6cqt8vjXkfdXNiOsOHxyaLtc7mzXKbbWK63yWXWxTvYirDg0tjbKF3W7dYqtuGanNF32fgZmE8KKU+nhMrnQ0qCTN+ep/Ze/7tXJboQVp87uzshtLpamy03S1d2lk90IK05PzntCUn2eV13jfFJcMStPJ7sRVhxG3TFKns/cpFNsW3I2y8ikETrZi7DisDGjUMaNvken2CaMGS/PLlirk70IawApYyfLmoef0cntxPl6XbkVPJIv43sDsxlhDWBrzhbPQ38XWi7I6xVvRB5FRHNuhZuzXtTJToQVw7yUuZI7Y6lObjtqSqSto012H92jV9xWzVkpcybN1sk+hOXDOQ6zLfe168djbuTsVlUn90fWXx2rkMa2i5H1jZyv25b7qufX24CwfDzeu+PMnjhLJ7cdtaWR51oO5zx7eZ33rjV38lxZnr5MJ7sQloeRSSPl5SXe75Gcp+9V9d/o1KfieGXkCLKXrTmvyIjb7Xv8QFge1i3Ml+QxyTq5lRzu362ucX5BXebzu8SJd06QNfO9P1WGGWFF6XsOtUYnt4bWf2TfCe+jxhXH/Hct5zBg8uhxOtmBsKJsXep/6yqp3XXTbnWNs2v5fUJ0bq0vZb2gkx0S/iML/5mCP1iFRQgLRhAWjCAsGEFYMIKwYARhwQjCghGEBSMIC0YQFowgLBhBWDCCsGAEYcEIwoIRhAUjCAtGEBYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAiPwPpf5ocrqPNx4AAAAASUVORK5CYII=';
const resWord =
    'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAUqSURBVHhe7d3PT1xFAMDxAZafpYjY8qv0l9GWRWko1UtvevBg/HH05qGJF+PRVE+esUdj4r/gpYkXL548eRCUBVtNDIlQQNpiqbQWKAvFN+y8vNn3ZrZN02Hfe/P9XHangULKl5l5s29TAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKRIg3rMrIHLs3vqaSYE3+yXN6+c+1wNc6tRPeKABL/Jn/Vfnp1Qw9wirDrwIS7COiCfvNmnnlXkPS7COiAfXjziVVyEdYB8iouwDpgvcRFWHfgQF2HVSd7jIqw6ynNchFVneY2LsFIgj3ERVkrkLS7CSpE8xUVYKZOXuAgrhfIQF2GlVNbjIqwUy3JchJVyWY2LsDIgi3ERVkbY4lJPU4ewMsQUV1oF0Wdb1t6l86ytXDmXyp8hMxacICw4QVhwgrDgBGHBCcKCE4QFJwgLThAWnCAsOEFYcIKw4ARhwQnCghOEBSe8vx/ri7d7RXtz8vfrqx//ESvrO2oUeeNMp3ir2KlGFeubu2Lih1U1qnbpYo94+WiLGkWultbF1MKmGj29tN6P5X1YVz86KV472a5GkY+/XRbfX7uvRpGvPxgU7452qVHFXvAdjE/MibUHyRB/+vQlcay7oEaR976ZFzPLW2r09LjRL6Wml8yzRrG/VT2rdv54MsKG4Ec7NtSmRpGu9iYx+Fwyqu2dPfHHrYdqlE/eh1WyhDUykAzlaGdBDHU3q1E1U1jFvtb96OKur2ztx5Vn3oc1s2Rejor9yVDGTyT/LHTBMJMNW2Y929fME+/DWrxbFqv/JfdGcgl7vqNJjSrODyXjCY0FYTU1Vk9PI5awbLNknngflmSbQc4GS5nOtL8KdbY2Jq7+ioblVCoxY/lh1nJ1pm/g5Ww0esy+FErjJ6Lw5Mef6U0eM9zb3BXza9tqlF+EFbDNICPaPms4mL0OtdT+5xrXZrRTPc3G8zH5teTxRN4RVkAeOZh+2MWBaMbSo7G5oM1Y+ufqbMcbeUNYAdvydLa3VRTUhnzseO1lUDr9QovoOVQ5t5JHDSY+XBFKhKWYlsOWQoM4faRybmXauMdP2vWD0mHDcYX029+E5RXbEcBwX9v+CfqLwWykk68PfjdzT40iYVivDibDWvq3LG7fTx5t5BFhKaVFywY+2CvJw8/4Cfrkwqb42fAisvzY7o4m0d+VfCnHh2OGEGEptpdZ5JGD6eWaX24EYc0nN/3yoNQ0W0kznmzcJcJSyrt74vebyRnllYE24xXhVBDWnWCPFd/0y4PS92N3P4SYsTxlWg57DxfE66eqw5IRhoeqk8GsFffO6GH1LLL7aE9c82TjLhGWxraBjx90ykC2yo/2n0/e2Nh/1HUYDlL/vL0tNrYrn+MDwtI86VIll8GQacYymV70Z38lEZZG7pfubuyqkd3UQjRL/XVn+4mOEJ7F3aJZQlgaeYU3u/z4mWU6thf71XJUofPhVhkdYcU8bjlcWCuLW7EZalKbwUzk3mou2GP5hLBibLfQhPRlMDQ5Xzss+XfuBFeFPiGsmPgyF6dv3EPXVx6KBzWu+HxbBiXCipGHnvJ2ZRvTewHlbFSqcdXnyx0NOsIysIUgb6+ZWzW/bcv0umHIxxnL8OakbOF/puANq/AIYcEJwoIThAUnCAtOEBacICw4QVhwgrDgBGHBCcKCE4QFJwgLThAWnCAsOEFYcIKw4ARhwQnCAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAkh/gf7Pq61bPUnSAAAAABJRU5ErkJggg==';
const resPowerPoint =
    'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAM6SURBVHhe7ds9iFxVHMbhdwUFk0I0okUCkQhiYWEjil+FhYjYKKSwEUsFxUIhIthKLCRGIwiKCCIoWFjbxa9CMUrARjQgJkYjBLORJBpknWUPGIZxJTD/mfvxPLDMOWeagf1x98y5dwMAAAAAAAAAAAAAAAAAAAAAAAAdstJee2vtyay1YT+s5cWVA3m2zQbrkvbKoqxkz9oT2dtmgyWsZRhBXMJalPv2tEEz8LiEtSh3Pz6quIS1SCOKS1iLNpK4hLUMI4hLWMsy8LiEtUwDjktYyzbQuITVBQOMS1hdMbC4hNUlA4pLWF0zkLiE1UUDiEtYXdXzuITVZT2OS1hd19O4hNUHPYxLWH3xH3G1UecIq09mxdVR/kun51Ze7ebv0BWLEsKihLAoISxKCIsSwqKEsCghLEoIixLCooSwKCEsSgiLEsKihLAo4XmsWS7bkjy0r03+x19nklM/J6u/JEcPJce/bW8sRlefxxLWLFuuTPaebJOLdOK75OD+5PM3kr/Pt8U6HvQbi2tuSHa/ljzzRXL19W1xfIRVZfvNyVMHk6t2toVxEValK7Ynj7w7+XvV+x3HRbPHmmWzPdbr9yenT7TJxKWXJzsmV6d7np5cna5ri1PefDA5/GGbzJc91lAcO5z89NW/P0c+TT4+kLx028a3w1lufbQNxkNY83L618m3wVfaZMquO9tgPIQ1T0e/boMpW7dtnI2NiLDm6fy5NkBY87TzljaYcvbUxgn9iAhrXrbtSu59rk2m/PBJG4yH44ZZNjtu+OiF5Nxqm0ysHzdce2Ny0wOTfdTWtjjl7YeTQ++1yXy5V1ikc/cKpx35LNl/1+SDzv9jrnOONUa/fZ+8tbssqi4TVpVvPkheviNZPd4WxkVY87T+TNaX7yT7bt+4Ul1462dk7LFm2WyP9f5jyZkL3vvzj+Ts7xu3c07+2BYXx+a9yMLDen7HJKJjbbJ8Nu+MirAoISxKCIsSwqKEsCghLEo4x+o551iMirAoISxKCIsSwqKEsCghLEoIixLCooSwKCEsSgiLEsKihLAoISxKCIsSwqKEsCghLAAAAAAAAAAAAAAAAAAAAAAAAACAjkj+Aagu0TbZZ0UaAAAAAElFTkSuQmCC';
const resZip =
    'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAQ1SURBVHhe7d3NT1NZGMfxh4Ii+JYB7SS+xLcETVSMiaPGzeioSxdGozs3/gMmmuCfoAsT/4CZ/2BWs3ShLomJC5NxBnBGUcGhUCz4AvLS1nvbR2kPvbRDetp77/l+kqbnXM7dwI/nPue2BQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABCpEWfI+v+k7m8Duvi7u+DOqqs7/J+Ha3a3RvH22/rOLYS+ozG6fN+Ge7oOLYIVnPEPlwEq0EO/rjsWx3rcNFjNcjFg2tkKJ2V56mcHvkulj0XFauBera0OlO5qFgGW7tCv2J940LlomI1gQuVi2A1SdzDRbCaKM7hosdqkNIeyxTHnouKFQJxrFxULEMjdoVB4lS5qFghEqfKRbBCJi7hIlghFIdw0WM1SC09linKPRcVK8SiXLmoWIZm7gqDRLFyUbEiIIqVi2BFRFC49Dl0CFaEBIQrlOixIs7rs0L5M6RiwQoqlqEBnyusKyoWnEKwYAXBghX0WBFHjwWnULEM7Arrg4oFKwgWrCBYsIIeK+LoseAUKpaBXWF9ULFgBcGCFQQLVtBjRRw9FpxCxTKwK6wPKhasIFiwgmDBCnqsiKPHglOoWCWy81n5494jnVV24dYZaVvTqrPmo2JFwNyXBR0FW5hd1BFWQrBKzH74oqNgMx9mdYSVEKwSU2MfdRRsKlV9DQhWmczotI6CZUaqrwHB+i6Xy0vq5aTOgo15a3LZZX+2EQaCpSaG38t8Lc27tyb9JqMzBCFY6r+hCR1V926w9rWuIliefD4v74bGdVadv9Y/B8EIlif9OiNzn+d1Vp2/Nv16SmeohGB53v41pqPajaziHJc4H6zcYm5VPdPoQEqy7A4DOR8s/xaDv9Mr1bGpXU5c7JULN08XHicu9cqG7k79atHC3KKM/1v99oSrCJZx78oP1S/XT8q2A0lpW9tWeGzrScrP136Sjo3tuqqolvternI+WJOj5U1479n9snbd8v974x87fK5HZ0XmuVjifLBmp8tfeE7u7dLRcsk93ToqMs/FEueD9X9uR5lvfOJWVjDng9Xp9VSlJoaDX64Zf/VeR0Wdm9fpCCbng5XcU37p+/Pxi4qvGfrHnj/+R2dF5rlY4nywdh3ZLi0tSxe5T5Mz8vC3/sJ9Kv+Wgv8Y+TslD3/tl0+ZGV3lXRa9c/xzURnvefc8ezAgL5+O6Kw2+47tlN7zzf9UNO95D7HDZ3tk6+4fdFbd1t1dcsg7B8EIlifRmpBTV47K3mM7yi6LJv9rfqU6dfWoJBKRL/ZWcSk0fEx/luFno4Ud4Mx08YMTnZs7Co2631Nt2rK+cCwswnopJFgRR48FpxAsWEGwYAXBghUEC1YQLFhBsGAFwYIVBAtWECxYQbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABCQuQrXdeK09aSJBYAAAAASUVORK5CYII=';
const resUnknow =
    'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAABu0lEQVR4nO2U0UkFARADr3w/048d2EWK8EMEzwYU3hNkbvcmkAYyu3McxhhjjDHmD8nbxzmsL6tAX2DQ89YQLjDmeWsIFxjyfKSv/dwJgR42D7bvXzshTALQjRCmAeg2CBMBdBOEqQC6BcJkAN0AYTqAToewAUAnQ9gCoFMhbALQiRC2Aeg0CBsBdBKErQA6BcJmAJ0AYTuAXh3CHQD0yhDuAqC/QKD3vxWA/gCB3n8MgPxT6f0FQIe+wPgB/AhRQfwQgUobSAXRoS8wfgA/QlQQP0Sg0gZSQXToC4wfwI8QFcQPEai0gVQQHfoC4wfwI0QF8UMEKm0gFUSHvsD4AfwIUUH8EIFKG0gF0aEvMH4AP0JUED9EoNIGUkF06AuMH8CPEBXEDxGotIFUEB36AuMH8CNEBfFDBCptIBVEh77A+AH8CFFB/BCBShtIBdGhLzB+AD9CVBA/RKDSBlJBdOgLjB/AjxAVxA8RqLSBVBAd+gLjB/AjRAXxQwQqbSAVRIe+wPgB/AhRQfwQgUobSAXRoS8wfgA/QlQQP0Sg0gZSQXToC4wfwI8QFcQPEai0gVSQMcYYY4w5ns83BfKY/WAMpP8AAAAASUVORK5CYII=';

const imageObj: Record<ImageType, string> = {
    pdf: 'data:@file/png;base64,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',
    doc: resWord,
    docx: resWord,
    xls: resExcel,
    xlsx: resExcel,
    ppt: resPowerPoint,
    pptx: resPowerPoint,
    txt: 'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAHESURBVHhe7duxTUMxFIbRAEUWQGIDKOgzCYOkCyOQjkHeJGzAKFRA4Q5FCKT/PV/7nMauky+WdeXsAAAAAAAAAAAAAAAAAAAAAAAAoCNXbS3r9e3js22rOB8P++e2H9Z1W1nP6fvH8NL2wxLWNoaPS1grebz78VEPHZewVnJ/ezNVXMJa0UxxCWtls8QlrA3MEJewNjJ6XMLa0MhxCWtjo8YlrA6MGJewOjFaXMLqyEhxCaszo8QlrA6NEJewOlU9LmF1rHJcwupc1biEVUDFuIRVxKW42todYRVyIa4u+ZdOccfDvsvv0IlFhLCIEBYRwiJCWEQIiwhhESEsIoRFhLCIEBYRwiJCWERM/7rhvLy33bZOTw9t9zdeNzAVYREhLCK8IC3OHYupCIsIYRFhjrWsM8f675zqN+5YTEVYRAiLCHOs4tyxmIqwiBAWEeZYi/dYCU4sIoRFhLCIMMcqzh2LqQiLCGERYY61eI+V4MQiQlhECIsIc6zi3LGYirCIEBYRwiJCWEQIiwhhESEsIoRFhLCIEBYRwiJCWEQIiwhhESEsIoRFhLCIEBYAAAAAAAAAAAAAAAAAAAAAAAAAQCd2uy+JUH6COCh1tAAAAABJRU5ErkJggg==',
    csv: 'data:@file/png;base64,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',
    html: 'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAO5SURBVHhe7dvRTtNQHIDxM7ItIEPBtVtCTCAh3mBCTEh8A2+UqRe8iz6CvgsXJpMF38BwZXgCuVPXwWQjAwabtDtl3egCmv239vT7JSc9LZVo/NKWQ6cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACACEnpbWyVKjtdPY2Fbld9+vJ6+4PeNdaM3mJCUin1fmt356PeNRZhTUES4iKsCXmz+lTPekyPi7Am5OWT1UTFRVgTlKS4CGvCkhIXYU1BEuIirCkxPS7CmiKT4yKsKTM1LsKKABPjIqyIMC0uwooQk+IirIgxJS7CiiAT4iKsiIp7XIQVYXGOi7AiLq5xEVYMxDEuwoqJUXHpaeQQVoyExRVVfEon5sqvtiP5f8gVCyIICyIICyIICyIICyIICyIICyIICyIICyIICyIICyIICyIICyIICyIICyIICyIICyIICyIICyKMeee9Uimrq6sr75irVHqnZ4PK5c96di2VUqWtt9504Pg9+N9/72tFtS8uvLlvff2ZWlsL/9DDr18/1f7+N73X53+/4b/HqH+Hj3feE8SpOXp2m1Ot6pnZCEvAUa2mOp3wDw85DmElyubmi4Ex7K6vB11eXqp6/Vjv9Z2fn6uTZkPvmY2wtOXl5YEx7K6vD3Oc33rW5zjXt8huMj4GSVhCnOrt56yk3AZdhDVm2WzW2x7XjwZ+SnXVar2w/HNMRlhjZtu2t+10Ot5DvK/VaqnT01Nvblm9c0xmbFh7e7uhQ5plFfRMqaq+Qrmq1f4zl5UnrNhqt9uhQ1qh0A8ruGblPbhrlr6qmYxb4ZjNzs6pXC7nzU/+1NWFXpWv6UXTubkHan5+3pubzNiwNjaeh45JsO2it3UXFtygGo2GOjtreccsy/K2pjM2rJWV1dAxCcF43CWG4JpWEh7cXdwKBbjxzMz0fjfcCyvwfEVY+F/pdFotLj325s1m8+YnwtzCwvUz2Kw3Nx1hCbEDVyZ/odTKJ+P5ykVYQmy7v+zgC65x3dfh4Y/QEXWEJWRxcUllMhm913uj0srnezv/4ODge+iIOsISkkqlVD5wO3z4aFFlEvA7Qp8xYWUyWe8K4Y9RgueM5bz06POKheLN8WKxt7blC/4Zd/iGj48aUWfMO+9JxTvvSBTCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCggjCAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiAil/gIKaDOlBPmOdQAAAABJRU5ErkJggg==',
    zip: resZip,
    '7z': resZip,
    rar: resZip,
    tar: resZip,
    exe: 'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAUDSURBVHhe7dtJbxtVAMDxZzvL2I5pm6W0JKVbSKOSVgihFhDhgsQFLojCgUs/RrlRbvApuHGAAzeEOPTCcqiQWFKESmnTqgkNbRqy4GUS28N74zdy7BnX9uEls/x/0sTzvMit8++8WVwBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhEhK30aWc/VLR69Gg+N8mvr4/Q/1KLbS+hZ7JZW64nz0xSd6FFuEtR8SEBdh7ZH6hdN6TYt5XIS1R5zzzyYqLsLaQ0mKi7D2WFLiIqx9kIS4CGufxD0uwtpHcY6LsPZZXOMirBCIY1yEFRJxi4uwQiROcRFWyMQlLsIKoTjERVghFfW4CCvEohwXYYVcVOMirAiIYlyEFRGd4tJroUNYERIYV0jxv3QiLnX1vVD+DtliwQjCghGEBSMIC0YQFowgLBhBWDCCsGAEYcEIwoIRhAUjCAtGEBaMICwYQVgwgrBgBGHBiER9g7Rya1lsXf9Dj7qb+OANUVq4K4oLt/U98gNLp8XoO/MibQ3qe6S6Ix5/9b2oV2x9hxDW8SOi8Nqcu776+TXhOHV3vZvChVlhPTelR93xDdIQcGQAjl3teVGsmUk3HO++enlbVP5adh/z2MurorZRbHltdvaYflS+3N5ueeyJSzUe37RmKuwibQ35tiDlm/dlpc0AKn/K8S5DU+NiYPyAHiVTosNSv/yRl2Y6LiLVmGVycyfdKdCjtk47D9fd9XrJFvb9R+66J3f+lF4Lln8x+P3UMng4HkEmO6zRETeCTosnM2KJ4emjetRQvrXk3qr9NjVVegYPHxRDR0b1KFju3InA91PLwNhT+lnRxlTYo/w5Gdqu3WT7zoq7T+QF5lFxgLB6ljmQF8PHn9YjuYtVrYnNH38Xtc2SvkdtAQti+NiEHiUbYfUh/8K0/NncbNmLD/Rag7u10vtlSRf5T6Gf81jlm0ti64cbeiT/8oMD7lFfu3RuWBx666IetVr/9iexvbSqR02ZQk6MvTsvX+z/SB9+9o38g+qBlClk5U//8wrzc133z9pxHiuEnJ2qqG2VfEv9v7J+hl++wz6U2iEPiipIbavse0+1CDm9xgVTYZ+cavAZ9E73J1Wip0J1aiDo8klqMCOsU62nFzz/fn1d7Kys6VFTOm+JsUuvi1TG/2+1fSosvHJWvsD/vKHJcffURj+YCkMoczAvsmemfEunqHYerQdGpdSLFd+lnk6sGf97qqXfqMKMqbAPxZ+bF6MV6/Qzeq2htLDYcrI0yQirR9W1zZajQTVdFl49657f8qhzWpXFFT1KNsLqUfFXuTXataNknTzqnq7Iymltt9LCHfk0tlqJDqu+WRa23MJ0WrxprbZREva91i2R2k9yb6cn5afY3H+urm35Lkq3s+/9E/h+alEXuOMg0UeF3UxcftM9ytv87oao7LomqKY/92SotnHtF2HfbYanjjYPvf2yHvmPCp9k5OKsyD1/Qo+646gwotTRnn37bz1qyJ5pfolPaZ8O1Vdqth881qNkIqwuivJIz6k3T36q72W1Hw02zj+pyzRNpd/kvlaCJWoqjCOmQiQKYcEIwoIRhAUjCAtGEBaMICwYQVgwgrBgBGHBCMKCEYQFIwgLRhAWjCAsGEFYMIKwYARhwQjCghGEBSMIC0YQFowgLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgJAQ4n/gYiZfiKWBTAAAAABJRU5ErkJggg==',
    apk: 'data:@file/png;base64,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',
};

export const getResImage = async (type: ImageType): Promise<string> => {
    if (imageObj[type]) {
        return imageObj[type];
    } else if (imageFiles.indexOf(type) >= 0) {
        return resImage;
    } else if (audioFiles.indexOf(type) >= 0) {
        return resAudio;
    } else if (videoFiles.indexOf(type) >= 0) {
        return resVideo;
    } else {
        return resUnknow;
    }
};

export const getMimeTypeFromExtension = (extension: string) => {
    if (extension[0] === '') {
        extension = extension.substr(1);
    }
    return (
        {
            aac: 'audio/aac',
            abw: 'application/x-abiword',
            arc: 'application/x-freearc',
            avi: 'video/x-msvideo',
            azw: 'application/vnd.amazon.ebook',
            bin: 'application/octet-stream',
            bmp: 'image/bmp',
            bz: 'application/x-bzip',
            bz2: 'application/x-bzip2',
            cda: 'application/x-cdf',
            csh: 'application/x-csh',
            css: 'text/css',
            csv: 'text/csv',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            eot: 'application/vnd.ms-fontobject',
            epub: 'application/epub+zip',
            gz: 'application/gzip',
            gif: 'image/gif',
            htm: 'text/html',
            html: 'text/html',
            ico: 'image/vnd.microsoft.icon',
            ics: 'text/calendar',
            jar: 'application/java-archive',
            jpeg: 'image/jpeg',
            jpg: 'image/jpeg',
            js: 'text/javascript',
            json: 'application/json',
            jsonld: 'application/ld+json',
            mid: 'audio/midi audio/x-midi',
            midi: 'audio/midi audio/x-midi',
            mjs: 'text/javascript',
            mp3: 'audio/mpeg',
            mp4: 'video/mp4',
            mpeg: 'video/mpeg',
            mpkg: 'application/vnd.apple.installer+xml',
            odp: 'application/vnd.oasis.opendocument.presentation',
            ods: 'application/vnd.oasis.opendocument.spreadsheet',
            odt: 'application/vnd.oasis.opendocument.text',
            oga: 'audio/ogg',
            ogv: 'video/ogg',
            ogx: 'application/ogg',
            opus: 'audio/opus',
            otf: 'font/otf',
            png: 'image/png',
            pdf: 'application/pdf',
            php: 'application/x-httpd-php',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            rar: 'application/vnd.rar',
            rtf: 'application/rtf',
            sh: 'application/x-sh',
            svg: 'image/svg+xml',
            swf: 'application/x-shockwave-flash',
            tar: 'application/x-tar',
            tif: 'image/tiff',
            tiff: 'image/tiff',
            ts: 'video/mp2t',
            ttf: 'font/ttf',
            txt: 'text/plain',
            vsd: 'application/vnd.visio',
            wav: 'audio/wav',
            weba: 'audio/webm',
            webm: 'video/webm',
            webp: 'image/webp',
            woff: 'font/woff',
            woff2: 'font/woff2',
            xhtml: 'application/xhtml+xml',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            xml: 'application/xml',
            xul: 'application/vnd.mozilla.xul+xml',
            zip: 'application/zip',
            '3gp': 'video/3gpp',
            '3g2': 'video/3gpp2',
            '7z': 'application/x-7z-compressed',
        }[extension] || 'application/octet-stream'
    );
};

export const convertBase64ToBlob = (base64Image: string): Blob => {
    // Split into two parts
    const parts = base64Image.split(';base64,');

    // Hold the content type
    const imageType = parts[0].split(':')[1];

    // Decode Base64 string
    const decodedData = window.atob(parts[1]);

    // Create UNIT8ARRAY of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length);

    // Insert all character code into uInt8Array
    for (let i = 0; i < decodedData.length; ++i) {
        uInt8Array[i] = decodedData.charCodeAt(i);
    }

    // Return BLOB image after conversion
    return new Blob([uInt8Array], { type: imageType });
};

export const convertBlobToFile = (blob: Blob, filename: string): File => {
    return new File([blob as any], filename, {
        lastModified: new Date().getTime(),
        type: blob.type,
    });
};

export function createFile(file: any, filename: string, id: number = 0) {
    const mime = require('mime-types');
    const fileExtension = mime.extension(file.type);
    const fileId = filename.substr(0, filename.lastIndexOf('.')) + '_' + id + '.' + fileExtension;
    const newFile = {
        id: fileId,
        name: filename,
        rawFile: file,
        size: file.size,
        status: 'File uploaded sucessfully',
        statusCode: '2',
        type: fileExtension,
        validationMessage: '',
    };
    return newFile;
}

export const convertBlobToFileJSZip = (blob: Blob, filename: string): File => {
    const fileExtension = filename.split('.').pop() as string;
    return new File([blob as any], filename, {
        lastModified: new Date().getTime(),
        type: getMimeTypeFromExtension(fileExtension),
    });
};

export const createFileJSZip = (file: any, filename: string, id: number = 0) => {
    const fileExtension = filename.split('.').pop();
    const fileId = filename.substr(0, filename.lastIndexOf('.')) + '_' + id + '.' + fileExtension;
    const newFile = {
        id: fileId,
        name: filename,
        rawFile: file,
        size: file.size,
        status: 'Ready to Upload',
        statusCode: '1',
        type: fileExtension,
        validationMessage: '',
    };
    return newFile;
};

export const toBase64 = (file: any) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export const fromBase64 = (file: any) =>
    new Promise((resolve) => {
        resolve(file);
    });
