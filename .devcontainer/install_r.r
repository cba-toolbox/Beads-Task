# 追加したいパッケージがあれば追加する。
# install R packages from CRAN
# install.packages(c("languageserver","vscDebugger"))


# install from GitHub
remotes::install_github(c("ykunisato/psyinfr"), dependencies = TRUE, force = TRUE)