# lnw &ndash; Linux Network Web (API and UI)
lnw &ndash; Linux Network Web (API and UI).

## FastAPI backend
Plus UI based on [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).

## Opinionated

* Tested on Debian only (both PC-like and RaspberryOS/Raspbian)
* Persists network config with **networkd/systemd**
    * Not NetworkManager
    * Not `/etc/network/interfaces`
        * Less Debian-centric in this sense
* Or perhaps **Netplan**?

