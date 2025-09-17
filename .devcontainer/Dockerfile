FROM ghcr.io/rocker-org/devcontainer/r-ver:4


ENV TZ=Asia/Tokyo
# Rのパッケージのインストール
COPY install_r.r install_r.r
RUN ["r", "install_r.r"]